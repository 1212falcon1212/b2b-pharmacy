<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoş Geldiniz</title>
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
            background: linear-gradient(135deg, #10b981, #059669);
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

        .button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
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
        <h1>🎉 Hoş Geldiniz!</h1>
    </div>
    <div class="content">
        <h2>Sayın {{ $user->pharmacy_name }},</h2>

        <p>Eczanenizin B2B Eczane Platformu üyelik başvurusu <strong>onaylanmıştır</strong>.</p>

        <p>Artık platformumuzda:</p>
        <ul>
            <li>✅ Ürün teklifleri oluşturabilir</li>
            <li>✅ Diğer eczanelerden alışveriş yapabilir</li>
            <li>✅ Siparişlerinizi yönetebilir</li>
            <li>✅ Cüzdanınızı ve ödemelerinizi takip edebilirsiniz</li>
        </ul>

        <p>Hesap bilgileriniz:</p>
        <ul>
            <li><strong>GLN Kodu:</strong> {{ $user->gln_code }}</li>
            <li><strong>E-posta:</strong> {{ $user->email }}</li>
        </ul>

        <center>
            <a href="{{ config('app.frontend_url') }}/login" class="button">Giriş Yap</a>
        </center>

        <p style="margin-top: 30px;">Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>

        <p>Saygılarımızla,<br><strong>B2B Eczane Platformu Ekibi</strong></p>
    </div>
    <div class="footer">
        <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
    </div>
</body>

</html>