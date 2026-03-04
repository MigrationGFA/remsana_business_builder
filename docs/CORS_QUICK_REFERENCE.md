# CORS Fix - Quick Reference Card

## 🎯 Two Files to Create/Modify

### 1️⃣ Create: app/Filters/Cors.php
```php
<?php
namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $origin = $request->header('Origin');
        
        $allowedOrigins = [
            'https://businessbuilder-test.azurewebsites.net',
            'http://localhost:5174',
            'http://localhost:5173',
        ];
        
        if ($origin && in_array($origin->getValue(), $allowedOrigins)) {
            header('Access-Control-Allow-Origin: ' . $origin->getValue());
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Api-Key');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
        }
        
        if ($request->getMethod() === 'options') {
            http_response_code(200);
            exit(0);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
```

### 2️⃣ Modify: app/Config/Filters.php
```php
public array $aliases = [
    'cors' => \App\Filters\Cors::class,  // <-- Add this line
    'csrf' => \CodeIgniter\Filters\CSRF::class,
    // ... rest of aliases
];

public array $globals = [
    'before' => [
        'cors',  // <-- Add this line
        // ... rest of before filters
    ],
];
```

## ✅ Deploy & Test
```bash
git add app/Filters/Cors.php app/Config/Filters.php
git commit -m "Add CORS support"
git push

# Test
curl -X OPTIONS https://rbbphpremsana-test.azurewebsites.net/api/v1/auth/login \
  -H "Origin: https://businessbuilder-test.azurewebsites.net" \
  -v | grep "Access-Control"
```

## 📋 Expected Result
```
Access-Control-Allow-Origin: https://businessbuilder-test.azurewebsites.net
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

Done! ✨
