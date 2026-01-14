const http = require('http');

const payload = JSON.stringify({
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "2170892106773150",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "15551518709",
                            "phone_number_id": "1004637292722037"
                        },
                        "contacts": [
                            {
                                "profile": {
                                    "name": "Tlotliso Mafantiri"
                                },
                                "wa_id": "26657683501"
                            }
                        ],
                        "messages": [
                            {
                                "from": "26657683501",
                                "id": "wamid.HBgLMjY2NTc2ODM1MDEVAgASGBQzQUI2NkQzQzcwREY4RDM4RjgwQQA=",
                                "timestamp": "1768387469",
                                "text": {
                                    "body": "Hi, how are you doing today?"
                                },
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Response status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error sending webhook:', error);
});

req.write(payload);
req.end();
