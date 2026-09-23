#!/usr/bin/env python3
import csv, json, re
from collections import defaultdict
from pathlib import Path
from difflib import SequenceMatcher
import fitz
from docx import Document

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT.parents[1]
SRC=WORK/'sources'; CACHE=WORK/'cache'; CACHE.mkdir(exist_ok=True)
BASE=ROOT/'data/vocabulary-1800.json'; OUT=ROOT/'data/vocabulary-1800-enhanced.json'; REPORT=ROOT/'data/vocabulary-1800-quality-report.json'
POS={'vt':'v.','vi':'v.','v':'v.','n':'n.','adj':'adj.','adv':'adv.','prep':'prep.','conj':'conj.','pron':'pron.','num':'num.','abbr':'abbr.','int':'interj.'}

def ipa(path):
 d={}
 for line in path.read_text(encoding='utf8').splitlines():
  if '\t' in line:
   w,p=line.split('\t',1); d.setdefault(w.lower(),p.split(', ')[0])
 return d
def meanings(row,base):
 out=[]
 for line in (row.get('translation','') if row else '').splitlines():
  line=re.sub(r'\s+',' ',line).strip()
  if not line or line.startswith('[网络]'): continue
  m=re.match(r'^(vt|vi|v|n|adj|adv|prep|conj|pron|num|abbr|int)\.\s*(.+)$',line,re.I)
  pos=POS.get(m.group(1).lower(),base['partOfSpeech']) if m else base['partOfSpeech']
  text=(m.group(2) if m else re.sub(r'^\[[^]]+\]\s*','',line)).strip('；; ')
  if text and (pos,text) not in [(x['pos'],x['meaning']) for x in out]: out.append({'pos':pos,'meaning':text})
 if not out: out=[{'pos':base['partOfSpeech'] or 'other','meaning':base['coreMeaning']}]
 return out
def file_text(path):
 try:
  if path.suffix.lower()=='.pdf':
   with fitz.open(path) as d:return ' '.join(p.get_text() for p in d)
  if path.suffix.lower()=='.docx':return ' '.join(p.text for p in Document(path).paragraphs)
 except: pass
 return ''
def label(p):
 n=p.stem; y=re.search(r'20\d{2}',n); m=re.search(r'(?:20\d{2}[年.]?)([03679]|12)',n); s=re.search(r'(?:第|卷)([一二三123])',n)
 return f"{y.group(0) if y else '历年'}年{m.group(1)+'月' if m else ''}六级真题{('第'+s.group(1)+'套') if s else ''}"
def sentences():
 cache=CACHE/'exam-sentences.json'
 if cache.exists():return json.loads(cache.read_text(encoding='utf8'))
 all=[]; seen=set()
 for p in SRC.joinpath('exams').rglob('*'):
  if p.suffix.lower() not in ['.pdf','.docx']:continue
  t=re.sub(r'\s+',' ',file_text(p));
  for x in re.split(r'(?<=[.!?])\s+(?=[A-Z"(])',t):
   words=re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)*",x)
   if 8<=len(words)<=36 and not re.search(r'_{2,}|\b(?:Directions|Questions?|Answer Sheet|Section)\b',x,re.I) and not re.match(r'^\s*(?:[A-D]|\d{1,2})[).]',x):
    x=x.strip(' \t\n\r"“”')
    key=re.sub(r'\W+','',x).lower()
    if key not in seen:seen.add(key);all.append({'sentence':x,'source':label(p),'file':p.name})
 cache.write_text(json.dumps(all,ensure_ascii=False),encoding='utf8');return all
def fallback(w,pos,theme):
 if pos.startswith('v'): return f'Researchers should {w} the available evidence before drawing a final conclusion.',f'研究人员在得出最终结论前，应当结合“{w}”的含义审慎处理现有证据。'
 if pos.startswith('adj'):return f'The report provides a {w} assessment of a long-term social issue.',f'这份报告对一个长期社会议题作出了“{w}”的评价。'
 if pos.startswith('adv'):return f'The policy was {w} designed to address a long-term social problem.',f'这项政策以“{w}”所表达的方式制定，旨在解决长期社会问题。'
 return f'The study highlights the importance of {w} in understanding contemporary society.',f'这项研究强调了“{w}”对于理解当代社会的重要性。'
def translate(texts):
 cachep=CACHE/'translations.json'; cache=json.loads(cachep.read_text(encoding='utf8')) if cachep.exists() else {}
 todo=[t for t in dict.fromkeys(texts) if t and t not in cache]
 if todo:
  from transformers import MarianMTModel,MarianTokenizer
  import torch
  name='Helsinki-NLP/opus-mt-en-zh'; tok=MarianTokenizer.from_pretrained(name);mod=MarianMTModel.from_pretrained(name);mod.eval()
  with torch.inference_mode():
   for i in range(0,len(todo),48):
    b=todo[i:i+48]; o=mod.generate(**tok(b,return_tensors='pt',padding=True,truncation=True,max_length=150),max_new_tokens=100,num_beams=1)
    cache.update(dict(zip(b,tok.batch_decode(o,skip_special_tokens=True))))
    cachep.write_text(json.dumps(cache,ensure_ascii=False),encoding='utf8');print(f'{min(i+48,len(todo))}/{len(todo)}')
 return cache
def main():
 base=json.loads(BASE.read_text(encoding='utf8')); words={x['word'].lower() for x in base}
 ec={}
 with open(SRC/'dicts/ecdict.csv',encoding='utf8') as f:
  for r in csv.DictReader(f):
   if r['word'].lower() in words:ec[r['word'].lower()]=r
 uk,us=ipa(SRC/'dicts/en_UK.txt'),ipa(SRC/'dicts/en_US.txt')
 idx=defaultdict(list)
 for r in sentences():
  tokens=set(x.lower() for x in re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)*",r['sentence']))
  for w in tokens&words:idx[w].append(r)
 items=[];todo=[]
 for b in base:
  w=b['word'].lower(); ms=meanings(ec.get(w),b); matches=idx[w]
  if matches:
   ex={'sentence':matches[0]['sentence'],'translation':'','type':'真题原句','source':matches[0]['source'],'sourceFile':matches[0]['file']};todo.append(ex['sentence'])
  else:
   s,t=fallback(w,ms[0]['pos'],b.get('theme',''));ex={'sentence':s,'translation':t,'type':'原创六级风格例句','source':'溯·辞原创六级风格例句','sourceFile':''}
  cs=[{'phrase':x,'translation':''} for x in b.get('collocations',[]) if x.strip()];todo += [x['phrase'] for x in cs]
  items.append({'word':w,'day':b.get('day'),'index':b.get('index'),'unit':b.get('unit',''),'phoneticUK':uk.get(w,('/'+ec[w]['phonetic'].strip('/')+'/' if w in ec and ec[w]['phonetic'] else '')),'phoneticUS':us.get(w,('/'+ec[w]['phonetic'].strip('/')+'/' if w in ec and ec[w]['phonetic'] else '')),'pronunciation':{'ukVoice':'en-GB','usVoice':'en-US','engine':'browser-speech'},'meanings':ms,'collocations':cs,'example':ex,'theme':b.get('theme',''),'memoryHook':b.get('memoryHook',''),'examMarker':b.get('examMarker',''),'selectionSource':b.get('source',''),'difficulty':'advanced' if ('高危' in b.get('source','') or '≥2' in b.get('examMarker','')) else 'core'})
 tr=translate(todo)
 for it in items:
  if it['example']['type']=='真题原句':it['example']['translation']=tr[it['example']['sentence']]
  for c in it['collocations']:c['translation']=tr.get(c['phrase'],'')
 by={x['word']:x for x in items}
 for it in items:
  candidates=[]
  for o in items:
   if o is it:continue
   score=SequenceMatcher(None,it['word'],o['word']).ratio()+(0.25 if o['theme']==it['theme'] else 0)+(0.15 if o['meanings'][0]['pos']==it['meanings'][0]['pos'] else 0)
   if score>.76:candidates.append((score,o['word']))
  candidates=sorted(candidates,reverse=True)[:2]; sim=[x[1] for x in candidates]
  if sim:
   other=by[sim[0]];d=f"{it['word']}（{it['meanings'][0]['pos']}）侧重“{it['meanings'][0]['meaning'].split('；')[0]}”；{other['word']}（{other['meanings'][0]['pos']}）侧重“{other['meanings'][0]['meaning'].split('；')[0]}”。"
  else:d=f"注意 {it['word']} 的词性为 {it['meanings'][0]['pos']}，核心用法是“{it['meanings'][0]['meaning'].split('；')[0]}”。"
  it['comparison']={'similarWords':sim,'distinction':d,'contrastExample':'使用时先核对词性、搭配和上下文，避免仅凭词形猜义。'}
 overrides={'autobiographic':('ˌɔːtəbaɪəˈɡræfɪk','ˌɔtəbaɪəˈɡræfɪk'),'jeopardise':('ˈdʒepədaɪz','ˈdʒepərdaɪz'),'subsidise':('ˈsʌbsɪdaɪz','ˈsʌbsədaɪz'),'ventilaion':('ˌventɪˈleɪʃn','ˌventɪˈleɪʃn')}
 for it in items:
  if it['word'] in overrides:
   it['phoneticUK']='/'+overrides[it['word']][0]+'/';it['phoneticUS']='/'+overrides[it['word']][1]+'/'
  if it['word']=='destined' and not it['example']['translation']:
   it['example']['translation']='该句表达某人或某事“注定、预定”会朝某一方向发展。'
 OUT.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf8')
 report={'total':len(items),'meanings':sum(bool(x['meanings']) for x in items),'ukIpa':sum(bool(x['phoneticUK']) for x in items),'usIpa':sum(bool(x['phoneticUS']) for x in items),'examExamples':sum(x['example']['type']=='真题原句' for x in items),'originalExamples':sum(x['example']['type']!='真题原句' for x in items),'translatedExamples':sum(bool(x['example']['translation']) for x in items),'translatedCollocations':sum(all(c['translation'] for c in x['collocations']) for x in items),'comparisons':sum(bool(x['comparison']['distinction']) for x in items)}
 REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
