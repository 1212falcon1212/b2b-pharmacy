<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Başvuru Durumu</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: #f59e0b;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }

        .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }

        .reason {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Başvuru Durumu</h1>
    </div>
    <div class="content">
        <h2>Sayın {{ $user->pharmacy_name }},</h2>

        <p>B2B Eczane Platformu üyelik başvurunuz incelendi.</p>

        <p>Maalesef başvurunuz şu an için onaylanamamıştır. Aşağıdaki sebeplerden dolayı başvurunuzu yeniden
            değerlendirmemiz gerekmektedir:</p>

        <div class="reason">
            <strong>Ret Sebebi:</strong><br>
            {{ $reason }}
        </div>

        <p>Başvurunuzu güncellemek veya eksik belgeleri tamamlamak için lütfen bizimle iletişime geçin.</p>

        <p>İletişim: <a href="mailto:destek@b2b-eczane.com">destek@b2b-eczane.com</a></p>

        <p>Saygılarımızla,<br><strong>B2B Eczane Platformu Ekibi</strong></p>
    </div>
    <div class="footer">
        <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
    </div>
</body>

</html>