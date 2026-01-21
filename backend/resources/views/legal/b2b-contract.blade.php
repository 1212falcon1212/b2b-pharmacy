<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
        }

        h1 {
            text-align: center;
            font-size: 18px;
        }

        .party {
            margin-bottom: 20px;
        }
    </style>
</head>

<body>
    <h1>MESAFELİ SATIŞ SÖZLEŞMESİ</h1>

    <div class="party">
        <strong>SATICI:</strong><br>
        {{ $seller_name }}
    </div>

    <div class="party">
        <strong>ALICI:</strong><br>
        {{ $buyer_name }}
    </div>

    <p>
        <strong>Sipariş No:</strong> {{ $order_id }}<br>
        <strong>Tarih:</strong> {{ $date }}
    </p>

    <h3>1. KONU</h3>
    <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait elektronik ortamda siparişini yaptığı ürünün satışı ve teslimi
        ile ilgilidir.</p>

    <h3>2. CAYMA HAKKI</h3>
    <p>ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 gün
        içinde cayma hakkına sahiptir.</p>

    <br><br>
    <p>İşbu sözleşme elektronik ortamda taraflarca onaylanmıştır.</p>
</body>

</html>