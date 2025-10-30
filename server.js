const express = require('express');
const fs = require('fs');
const path = require('path');

// اسم متغير البيئة الذي يحتوي على مفتاح التشفير
// في هذه الحالة، سنستخدمه للتحقق من أن الخادم يعمل في بيئة آمنة
const ENCRYPTION_KEY = process.env.KEY; 

// اسم الملف المشفر
const ENCRYPTED_FILE = 'index.encrypted';

const app = express();
const port = process.env.PORT || 3000;

// قراءة الملف المشفر مرة واحدة عند بدء التشغيل
let encryptedContent;
try {
    encryptedContent = fs.readFileSync(path.join(__dirname, ENCRYPTED_FILE), 'utf8');
} catch (error) {
    console.error(`ERROR: Could not read encrypted file ${ENCRYPTED_FILE}.`);
    process.exit(1);
}

// دالة فك التشفير (باستخدام Base64 كنموذج)
function isMaintenanceTime(){
    // Note: This uses the server's time.
    // الخميس (4) من 4:00 صباحاً إلى 10:00 صباحاً
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    return day === 4 && hours >= 4 && hours < 10;
}

function analyzePackage(){
    const rand = Math.random() * 100;
    let percentage;
    if (rand < 50) percentage = Math.floor(Math.random()*50) + 1;
    else if (rand < 80) percentage = Math.floor(Math.random()*25) + 51;
    else if (rand < 95) percentage = Math.floor(Math.random()*14) + 76;
    else percentage = Math.floor(Math.random()*6) + 90;
    
    let resultMessage;
    let resultClass;

    if (percentage <= 50){
        resultClass = 'result-bad';
        resultMessage = '😞 [النسبة غير جيدة]<br><br><strong>BAD PROBABILITY</strong><br>لا تفتح الباكج الآن<br>Do not open the package now<br><br>حاول مرة أخرى في وقت لاحق<br>Try again later for better results';
    } else if (percentage <= 75){
        resultClass = 'result-weak';
        resultMessage = '⚠️ [النسبة ضعيفة]<br><br><strong>WEAK PROBABILITY</strong><br>النسبة ليست جيدة<br>The probability is not good<br><br>يُنصح بالمحاولة مرة أخرى<br>Recommended to try again';
    } else if (percentage <= 89){
        resultClass = 'result-medium';
        resultMessage = '⚡ [النسبة متوسطة]<br><br><strong>MEDIUM PROBABILITY</strong><br>مقبول للفتح<br>Acceptable to open<br><br>لكن يُفضل المحاولة للحصول على نسبة أفضل<br>But better to try for higher percentage';
    } else {
        resultClass = 'result-good';
        resultMessage = '✅ [النسبة جيدة للفتح]<br><br><strong>GOOD PROBABILITY!</strong><br>🎉 بالتوفيق!<br>🎉 Good luck!<br><br>الوقت مناسب للفتح<br>Perfect time to open the package';
    }

    // Cooldown logic: Server generates the cooldown end time
    const now = Date.now();
    const randomCooldown = (120 + Math.random() * 180) * 1000; // 120s - 300s
    const cooldownEnd = now + Math.floor(randomCooldown);

    return { percentage, resultMessage, resultClass, cooldownEnd };
}
function decryptContent(encryptedText) {
    // في هذا النموذج، نستخدم Base64 لتمثيل عملية التشفير/فك التشفير
    // في التطبيق الحقيقي، يجب استخدام خوارزمية تشفير قوية مثل AES-256-CBC
    // مع استخدام المفتاح ENCRYPTION_KEY
    
    // فك تشفير Base64
    const decryptedBuffer = Buffer.from(encryptedText, 'base64');
    return decryptedBuffer.toString('utf8');
}

// نقطة النهاية الرئيسية
app.get('/', (req, res) => {
    // التحقق من وجود مفتاح التشفير (للتأكد من أننا لسنا في بيئة تطوير غير آمنة)
    if (!ENCRYPTION_KEY) {
        // يمكنك تعديل هذه الرسالة لتناسب احتياجاتك
        return res.status(500).send('ERROR: KEY environment variable is not set. Cannot decrypt content.');
    }

    try {
        const decryptedHtml = decryptContent(encryptedContent);
        res.send(decryptedHtml);
    } catch (error) {
        console.error('Decryption failed:', error);
        res.status(500).send('ERROR: Failed to decrypt content.');
    }
});

// خدمة الملفات الثابتة (CSS, JS)
app.use(express.static(path.join(__dirname)));
app.use('/style.css', express.static(path.join(__dirname, 'style.css')));
app.use('/script.js', express.static(path.join(__dirname, 'script.js')));
app.use(express.json()); // لتمكين قراءة JSON من الطلبات

// نقطة نهاية API الجديدة للتحليل
app.post('/api/scan', (req, res) => {
    // 1. التحقق من الصيانة (باستخدام وقت الخادم)
    if (isMaintenanceTime()) {
        return res.json({ maintenance: true });
    }

    // 2. تنفيذ منطق التحليل الحساس
    const analysisResult = analyzePackage();

    // 3. إرسال النتائج إلى العميل
    res.json({
        maintenance: false,
        percentage: analysisResult.percentage,
        resultMessage: analysisResult.resultMessage,
        resultClass: analysisResult.resultClass,
        cooldownEnd: analysisResult.cooldownEnd
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Using KEY: ${ENCRYPTION_KEY ? 'Set' : 'Not Set'}`);
    console.log(`Serving decrypted content from ${ENCRYPTED_FILE}`);
});
