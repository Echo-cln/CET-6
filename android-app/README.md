# 溯·辞 Android

这是可直接用 Android Studio 打开的完整工程。App 打开国内镜像，并与网页版共用同一份账号和学习记录；手机用户不需要代理或 Android Studio。

## 直接打开

1. 将本文件夹解压到 `E:\Programs\su-ci-vocabulary-source\android-app`（不要改变 `android-app` 这一层目录名）。
2. Android Studio 选择 **Open**，打开该 `android-app` 文件夹。
3. 点击 **Sync Project with Gradle Files**。

工程已包含 `gradle/wrapper/`、`gradlew.bat` 和 `gradle-offline/gradle-8.9-bin.zip`。首次同步的 Gradle 本体不再从海外下载。

> Android SDK、Android Gradle Plugin 与 AndroidX 依赖仍是 Android Studio 的标准构建依赖；若本机尚未安装 SDK，Android Studio 会提示安装。它们只影响电脑编译 APK，绝不会影响手机使用 App。

## 生成给手机安装的 APK

在 Android Studio 顶部菜单选择 **Build → Build APK(s)**。完成后，点击右下角的 *locate*，得到：

`app/build/outputs/apk/debug/app-debug.apk`

把这个 APK 发送到 Android 手机，允许“从此来源安装应用”后即可安装。安装后的 App 仅访问国内站点，不需要梯子。

## 打开与运行

1. Android Studio 选择 `Open`，打开这个 `android-app` 文件夹。
2. 首次同步时，Android Studio 会下载所需 Gradle 和 Android SDK 组件；按提示接受即可。
3. 连接 Android 手机并开启 USB 调试，或创建模拟器。
4. 点击绿色运行按钮。安装包名为 `com.echo.suci`。

支持：账号登录、学习记录同步、下拉刷新、返回网页历史、断网重试。后续可在此工程中逐页替换为原生 Kotlin 页面，并加入通知提醒、离线词包和发音录音。
