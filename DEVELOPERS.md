# دليل المطورين - Quran Video Editor

## البنية التقنية

### لماذا بدون FFmpeg؟

تم اتخاذ قرار عدم استخدام FFmpeg للأسباب التالية:

1. **مشاكل التوزيع**: FFmpeg يتطلب ملفات DLL إضافية صعبة التوزيع
2. **الحجم الكبير**: يزيد حجم التطبيق بشكل كبير (100+ ميجابايت)
3. **التوافق**: مشاكل في التوافق عبر الأنظمة المختلفة
4. **البديل الأفضل**: Web APIs توفر نفس الوظائف بشكل أصلي

### البدائل المستخدمة

| الوظيفة | FFmpeg | البديل في التطبيق |
|---------|--------|-------------------|
| قراءة معلومات الفيديو | ffprobe | HTMLVideoElement.duration |
| معالجة الإطارات | ffmpeg | Canvas API |
| إضافة النصوص | ffmpeg -vf drawtext | Canvas drawText |
| تطبيق الفلاتر | ffmpeg -vf | Canvas filters |
| استخراج الصوت | ffmpeg -vn | Web Audio API |
| تسجيل الفيديو | ffmpeg | MediaRecorder API |

## هيكل المشروع

```
quran-video-editor/
├── src/
│   ├── main/                           # Electron Main Process
│   │   ├── index.ts                   # نقطة دخول التطبيق
│   │   ├── ipc-handlers.ts            # معالجات الاتصال IPC
│   │   ├── preload.ts                 # سكريبت Preload (Security Bridge)
│   │   ├── web-video-handler.ts       # معالج ملفات الفيديو
│   │   └── whisper-client.ts          # عميل Whisper API
│   │
│   ├── renderer/                       # React Renderer Process
│   │   ├── App.tsx                    # المكون الرئيسي
│   │   ├── components/                # مكونات الواجهة
│   │   │   ├── VideoUploader.tsx     # رفع الفيديو
│   │   │   ├── VideoPreview.tsx      # معاينة الفيديو
│   │   │   ├── Timeline.tsx          # الشريط الزمني
│   │   │   ├── EditorTools.tsx       # أدوات التحرير
│   │   │   ├── TextEditor.tsx        # أدوات النصوص
│   │   │   ├── VideoEffects.tsx      # أدوات الفيديو
│   │   │   ├── AudioEditor.tsx       # أدوات الصوت
│   │   │   ├── ExportSettings.tsx    # إعدادات التصدير
│   │   │   ├── ProjectManager.tsx    # إدارة المشروع
│   │   │   └── Toolbar.tsx           # شريط الأدوات
│   │   │
│   │   ├── services/                  # خدمات معالجة الفيديو
│   │   │   ├── canvas-video-processor.ts  # المعالج الرئيسي
│   │   │   └── video-processing.ts        # واجهة الخدمات
│   │   │
│   │   ├── hooks/                     # React Hooks
│   │   │   └── useIpc.ts             # Hook للاتصال مع Main Process
│   │   │
│   │   ├── defaults.ts                # القيم الافتراضية
│   │   ├── styles.css                 # ملف التصميم الرئيسي
│   │   └── index.tsx                  # نقطة دخول React
│   │
│   ├── services/                       # خدمات مشتركة (deprecated)
│   └── types/                          # TypeScript Type Definitions
│       └── index.ts                   # التعريفات الرئيسية
│
├── public/                             # الملفات العامة
│   ├── index.html                     # HTML الرئيسي
│   └── icon.ico                       # أيقونة التطبيق
│
├── dist/                               # ملفات البناء
├── release/                            # ملفات التوزيع
├── package.json                        # اعتماديات المشروع
├── tsconfig.json                       # إعدادات TypeScript (Renderer)
├── tsconfig.main.json                  # إعدادات TypeScript (Main)
├── webpack.config.js                   # إعدادات Webpack
└── electron-builder.json               # إعدادات البناء
```

## سير العمل (Workflow)

### 1. رفع الفيديو
```typescript
// Renderer Process
const file = event.target.files[0];
onUpload(file);

// في App.tsx
const metadata = await videoProcessor.getVideoMetadata(file);
// يستخدم HTMLVideoElement للحصول على المعلومات
```

### 2. التعرف على الكلمات
```typescript
// Renderer Process - استخراج الصوت
const audioBlob = await videoProcessor.extractAudio(videoFile);

// Main Process - استدعاء Whisper API
const result = await transcribeAudio(audioPath);
// يستخدم OpenAI Whisper API
```

### 3. معالجة الفيديو
```typescript
// Renderer Process - معالجة باستخدام Canvas
const processedBlob = await videoProcessor.processVideo(
  videoFile,
  options,
  onProgress
);
```

### 4. التصدير
```typescript
// حفظ الملف
const arrayBuffer = await processedBlob.arrayBuffer();
await window.api.saveVideoBlob(arrayBuffer, outputPath);
```

## APIs المستخدمة

### Canvas API
```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// رسم الفيديو
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

// إضافة النصوص
ctx.font = '32px Arial';
ctx.fillText('نص الترجمة', x, y);

// تطبيق الفلاتر
ctx.filter = 'brightness(120%) contrast(110%)';
```

### MediaRecorder API
```javascript
const stream = canvas.captureStream(30);
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 8000000
});

recorder.ondataavailable = (e) => {
  chunks.push(e.data);
};

recorder.start();
```

### Web Audio API
```javascript
const audioContext = new AudioContext();
const arrayBuffer = await file.arrayBuffer();
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
```

## الأمان (Security)

### Context Isolation
```typescript
// في preload.ts
contextBridge.exposeInMainWorld('api', {
  // فقط الوظائف الآمنة
  getMetadata: (filePath) => ipcRenderer.invoke('video:metadata', filePath)
});
```

### IPC Communication
```typescript
// في Main Process
ipcMain.handle('video:metadata', async (_, filePath) => {
  // التحقق من صحة المسار
  await ensureExists(filePath);
  return readVideoMetadata(filePath);
});
```

## التحسينات المستقبلية

### المخطط (Roadmap)

1. **دعم معالجة دفعية** - معالجة عدة فيديوهات دفعة واحدة
2. **قوالب جاهزة** - قوالب تصميم جاهزة للترجمات
3. **تحسين الأداء** - استخدام Web Workers للمعالجة
4. **دعم الإضافات** - نظام إضافات للمزايا الإضافية
5. **تصدير MP4** - دعم تصدير MP4 بجودة عالية
6. **معاينة مباشرة** - معاينة التغييرات في الوقت الفعلي

### المساهمة

نرحب بالمساهمات! يُرجى:
1. Fork المشروع
2. إنشاء Feature Branch
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

## الاختبار

```bash
# تشغيل التطبيق في وضع التطوير
npm run dev

# بناء التطبيق
npm run build

# بناء للتوزيع
npm run dist:win
```

## الأسئلة الشائعة

### لماذا WebM وليس MP4؟
MediaRecorder API يدعم WebM بشكل أصلي. لتصدير MP4، يلزم معالجة إضافية.

### هل يمكن استخدام FFmpeg لاحقاً؟
نعم، يمكن إضافة FFmpeg كخيار اختياري للمستخدمين المتقدمين.

### ما هي حدود الحجم؟
يُنصح بفيديوهات أقل من 500 ميجابايت للأداء الأمثل.

## الدعم

- GitHub Issues: للإبلاغ عن الأخطاء
- Discussions: للأسئلة والاقتراحات

---

**صُنع بحب لخدمة القرآن الكريم** ❤️
