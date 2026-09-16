# CamScanner Pro - Android APK Build & Download Guide

Google AI Studio একটি ক্লাউড-বেসড Node.js/Web কন্টেইনারে চলে, যাতে প্রায় ৫+ গিগাবাইট আকারের পূর্ণাঙ্গ Android SDK (Java 17, Gradle, AAPT2, D8/R8 Dex compiler) অন্তর্ভুক্ত থাকে না। তাই সরাসরি ক্লাউড ব্রাউজারে ইনস্টলযোগ্য আসল `.apk` ফাইল জেনারেট করার জন্য নিচের **১০০% অটোমেটিক ও ফ্রি পদ্ধতিটি** যুক্ত করা হয়েছে:

---

## ১. GitHub Actions দিয়ে ১-ক্লিকে ফ্রি APK ডাউনলোড (সবচেয়ে সহজ)

এই রিপোজিটরিতে ইতিমধ্যে `.github/workflows/build-apk.yml` ফাইলটি যুক্ত করা আছে।

### ধাপসমূহ:
1. Google AI Studio-র উপরের ডানদিকের **Settings / Project Options** থেকে **Export to GitHub** এ ক্লিক করুন।
2. আপনার GitHub অ্যাকাউন্টে রিপোজিটরিটি পুশ হওয়া মাত্রই GitHub Actions স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে `flutter build apk --release` রান করবে।
3. আপনার GitHub রিপোজিটরির **Actions** ট্যাবে যান।
4. সর্বশেষ সম্পন্ন হওয়া বিল্ডে ক্লিক করুন এবং **Artifacts** সেকশন থেকে সরাসরি **`CamScanner-Pro-Release-APK.zip`** ফাইলটি ডাউনলোড করে নিন।
5. জিপ ফাইলের ভেতর আপনি অফিসিয়াল সাইনড `app-release.apk` পেয়ে যাবেন যা সরাসরি যেকোনো অ্যান্ড্রয়েড ফোনে ইনস্টল করা যাবে!

---

## ২. আপনার কম্পিউটারে লোকালি APK তৈরি করার নিয়ম

যদি আপনার কম্পিউটারে Flutter SDK ইনস্টল করা থাকে:

```bash
# ১. flutter_project ফোল্ডারে প্রবেশ করুন
cd flutter_project

# ২. সকল প্যাকেজ ডাউনলোড করুন
flutter pub get

# ৩. রিলিজ APK বিল্ড করুন
flutter build apk --release
```

বিল্ড শেষ হলে নিচের পাথে আপনার ইন্সটলযোগ্য APK ফাইলটি পেয়ে যাবেন:
`flutter_project/build/app/outputs/flutter-apk/app-release.apk`

---

## প্রজেক্টে যুক্ত থাকা ফিচারসমূহ:
- ✅ ক্যামেরা ও গ্যালারি অটো-স্ক্যান (Google Play Services ML Kit Document Scanner API)
- ✅ 4-পয়েন্ট পার্সপেক্টিভ ট্রান্সফর্ম ও আনস্কিউ (Kotlin / OpenCV)
- ✅ ম্যাজিক কালার ফিল্টার ও ব্যাকগ্রাউন্ড শ্যাডো রিমুভাল
- ✅ একক বা মাল্টি-পেজ উচ্চমানের প্রিন্টেবল PDF এক্সপোর্ট
- ✅ অন-ডিভাইস OCR (Text Recognition) এবং সরাসরি Microsoft Word (.docx) এক্সপোর্ট
- ✅ ইন-বিল্ট PDF Viewer
