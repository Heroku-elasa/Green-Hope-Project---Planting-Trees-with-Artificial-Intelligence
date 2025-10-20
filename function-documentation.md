# مستندات توابع پروژه (Function Documentation)

این سند توابع اصلی و سرویس‌های استفاده شده در برنامه Civicavita AB را تشریح می‌کند. هدف آن ارائه یک مرجع فنی برای توسعه و نگهداری آسان‌تر است.

---

## سرویس‌های Gemini (`services/geminiService.ts`)

این فایل شامل تمام تعاملات با Google Gemini API است.

### `generateReportStream(topic, description, reportType)`

-   **توضیحات:** یک گزارش متنی (مانند پروپوزال گرنت) را به صورت جریانی (stream) بر اساس موضوع، توضیحات و نوع گزارش انتخاب شده، تولید می‌کند.
-   **پارامترها:**
    -   `topic` (string): موضوع اصلی گزارش.
    -   `description` (string): جزئیات و نکات کلیدی برای تولید محتوا.
    -   `reportType` (string): نوع گزارش (مثلاً 'grant_proposal').
-   **خروجی:** `AsyncGenerator<string>` - یک مولد ناهمزمان که تکه‌های متن تولید شده را به صورت `string` برمی‌گرداند.

### `findGrants(prompt)`

-   **توضیحات:** با استفاده از ابزار جستجوی گوگل (Google Search grounding)، گرنت‌های مرتبط با کلمات کلیدی کاربر را جستجو می‌کند.
-   **پارامترها:**
    -   `prompt` (string): کلمات کلیدی وارد شده توسط کاربر برای جستجو.
-   **خروجی:** `Promise<GrantResult>` - یک Promise که به یک شیء با دو کلید `text` (پاسخ متنی مدل) و `sources` (لیست منابع وب استفاده شده) حل می‌شود.

### `analyzeGrantDetails(grantUrl, keywords)`

-   **توضیحات:** یک URL مربوط به گرنت را دریافت کرده و با استفاده از جستجوی وب، جزئیات آن را تحلیل و یک خلاصه ساختاریافته در قالب JSON برمی‌گرداند.
-   **پارامترها:**
    -   `grantUrl` (string): آدرس اینترنتی صفحه گرنت.
    -   `keywords` (string): کلمات کلیدی کاربر برای ارزیابی میزان ارتباط گرنت.
-   **خروجی:** `Promise<GrantSummary>` - یک Promise که به یک شیء JSON با جزئیات کامل گرنت (مانند مبلغ، ددلاین، شرایط و ...) حل می‌شود.

### `generateVideoScript(...)`

-   **توضیحات:** یک اسکریپت ویدیویی کامل، شامل صحنه‌ها، نریشن و توضیحات بصری را بر اساس ورودی کاربر (متن و/یا تصویر) تولید می‌کند.
-   **پارامترها:**
    -   `userPrompt` (string): توضیحات کاربر در مورد مفهوم ویدیو.
    -   `image` (object | null): تصویر مرجع برای راهنمایی سبک بصری.
    -   `duration` (number): مدت زمان تقریبی ویدیو به ثانیه.
    -   `withWatermark` (boolean): آیا واترمارک اضافه شود یا خیر.
    -   `languageCode` ('en' | 'fa'): زبان نریشن.
    -   `videoType` ('general' | 'research_showcase'): نوع ویدیو.
-   **خروجی:** `Promise<VideoScene[]>` - یک Promise که به آرایه‌ای از اشیاء `VideoScene` حل می‌شود.

### `generateSingleVideoScene(...)`

-   **توضیحات:** یک کلیپ ویدیویی کوتاه برای یک صحنه خاص بر اساس توضیحات بصری آن تولید می‌کند. این تابع با مدل `veo-2.0-generate-001` کار می‌کند و وضعیت عملیات را تا زمان تکمیل بررسی (poll) می‌کند.
-   **پارامترها:**
    -   `sceneDescription` (string): توضیحات بصری برای هوش مصنوعی.
    -   `image` (object | null): تصویر مرجع.
    -   `negativePrompt` (string | undefined): مواردی که نباید در ویدیو وجود داشته باشند.
    -   `aspectRatio` (string | undefined): نسبت تصویر ویدیو.
    -   `numberOfVideos` (number): تعداد نسخه‌های ویدیو برای تولید.
-   **خروجی:** `Promise<string[]>` - یک Promise که به آرایه‌ای از URLهای Blob مربوط به ویدیوهای تولید شده حل می‌شود.

### `generateSceneImage(sceneDescription)`

-   **توضیحات:** یک تصویر ثابت برای یک صحنه بر اساس توضیحات بصری آن با استفاده از مدل `imagen-4.0-generate-001` تولید می‌کند.
-   **پارامترها:**
    -   `sceneDescription` (string): توضیحات بصری برای تولید تصویر.
-   **خروجی:** `Promise<string>` - یک Promise که به یک URL داده (Data URL) از تصویر تولید شده (base64) حل می‌شود.

### `askGoogleBabaAboutImage(image, textPrompt)`

-   **توضیحات:** یک تصویر را تحلیل کرده و با استفاده از جستجوی وب، اطلاعاتی در مورد آن ارائه می‌دهد.
-   **پارامترها:**
    -   `image` (object): تصویر برای تحلیل.
    -   `textPrompt` (string | undefined): سوال یا تمرکز خاص کاربر.
-   **خروجی:** `Promise<GrantResult>` - مشابه `findGrants`، یک شیء با `text` و `sources` برمی‌گرداند.

### `generateMusicDescription(prompt)`

-   **توضیحات:** بر اساس مفهوم ویدیو، یک توصیف متنی برای موسیقی پس‌زمینه مناسب تولید می‌کند.
-   **پارامترها:**
    -   `prompt` (string): مفهوم ویدیوی کاربر.
-   **خروجی:** `Promise<string>` - یک Promise که به یک متن توصیفی برای موسیقی حل می‌شود.

---

## سرویس پایگاه داده (`services/dbService.ts`)

این فایل توابع مربوط به مدیریت پایگاه داده IndexedDB در مرورگر را برای ذخیره گرنت‌ها فراهم می‌کند.

### `initDB()`

-   **توضیحات:** پایگاه داده IndexedDB را با نام و نسخه مشخص شده راه‌اندازی می‌کند.
-   **پارامترها:** ندارد.
-   **خروجی:** `Promise<boolean>` - در صورت موفقیت `true` برمی‌گرداند.

### `addGrants(grants)`

-   **توضیحات:** آرایه‌ای از گرنت‌ها را در پایگاه داده ذخیره یا به‌روزرسانی می‌کند.
-   **پارامترها:**
    -   `grants` (Grant[]): لیستی از اشیاء گرنت.
-   **خروجی:** `Promise<void>` - پس از اتمام عملیات حل می‌شود.

### `getAllGrants()`

-   **توضیحات:** تمام گرنت‌های ذخیره شده در پایگاه داده را بازیابی می‌کند.
-   **پارامترها:** ندارد.
-   **خروجی:** `Promise<Grant[]>` - یک Promise که به آرایه‌ای از گرنت‌های ذخیره شده حل می‌شود.

### `clearAllGrants()`

-   **توضیحات:** تمام داده‌های موجود در انبار گرنت‌ها را پاک می‌کند.
-   **پارامترها:** ندارد.
-   **خروجی:** `Promise<void>` - پس از پاک‌سازی کامل حل می‌شود.

---

## توابع اصلی برنامه (`App.tsx`)

این فایل شامل توابع کنترل‌کننده رویداد (event handlers) است که منطق اصلی برنامه و ارتباط بین UI و سرویس‌ها را مدیریت می‌کنند.

### `handleGenerateReport(topic, description, reportType)`

-   **توضیحات:** فرآیند تولید گزارش را با فراخوانی `generateReportStream` آغاز کرده و نتایج را در state برنامه به‌روزرسانی می‌کند.

### `handleFindGrants(keywords)`

-   **توضیحات:** با فراخوانی `findGrants`، گرنت‌ها را جستجو کرده و لیست نتایج را در state قرار می‌دهد.

### `handleAnalyzeGrant(grant, keywords)`

-   **توضیحات:** فرآیند تحلیل یک گرنت مشخص را با فراخوانی `analyzeGrantDetails` آغاز کرده و نتیجه را برای نمایش در `GrantAdopter` در state ذخیره می‌کند.

### `handleGenerateScript()`

-   **توضیحات:** با فراخوانی `generateVideoScript`، اسکریپت ویدیو را تولید کرده و صحنه‌ها را در state مربوط به ویدیو قرار می‌دهد.

### `handleGenerateSceneVideo(sceneIndex, isAlternative)`

-   **توضیحات:** تولید ویدیو برای یک صحنه خاص را با فراخوانی `generateSingleVideoScene` آغاز کرده و state آن صحنه را (مثلاً وضعیت `isGenerating` و `videoUrls`) به‌روزرسانی می‌کند.

### `handleGenerateSceneImage(sceneIndex)`

-   **توضیحات:** تولید تصویر برای یک صحنه را با فراخوانی `generateSceneImage` مدیریت می‌کند.

### `handleGenerateMusic()`

-   **توضیحات:** تولید توضیحات موسیقی را با فراخوانی `generateMusicDescription` آغاز می‌کند.

### `handleCreateCheckpoint()`

-   **توضیحات:** وضعیت فعلی کل برنامه (state) را به عنوان یک "نقطه بازرسی" (checkpoint) در `localStorage` ذخیره می‌کند.

### `handleRestoreCheckpoint(id)`

-   **توضیحات:** وضعیت برنامه را از یک نقطه بازرسی ذخیره شده بازیابی می‌کند.

### `handleDeleteCheckpoint(id)`

-   **توضیحات:** یک نقطه بازرسی مشخص را از `localStorage` حذف می‌کند.
