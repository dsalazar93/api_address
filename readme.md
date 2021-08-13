# API de Forward Geocoding

API Rest con registro, autenticación, refresco y búsqueda de Coordenadas a partir de direcciones.

## Instalación

```bash
git clone https://github.com/dsalazar93/api_address.git
npm install
```
Luego se debe crear la base de datos en MySQL preferiblemente versión 5.7 a partir del archivo **bd_coordenadas.sql** a través de MySQL Workbench o MySQL Shell.

Por último se debe crear el archivo **.env** para poder manejar las variables de entorno.
## Ejecución

```bash
npm run dev
```

## Rutas
- /api/sing-up recibe un objeto JSON y cabecera **Content-Type : application/json**. Se encarga de registrar un usuario
```json
{
	"username": "",
	"password": "",
	"password_repeat": ""
}
``` 

- /api/login recibe un objeto JSON y cabecera **Content-Type : application/json**. Se encarga de autenticar usuario y generar los jwt
```json
{
	"username": "",
	"password": ""
}
```

- /api/get_coordinates/ recibe un objeto JSON y cabeceras **Content-Type : application/json** - **Authorization : Bearer token**. Se encarga de entregar las coordenadas relacionadas con la dirección que se envie.
```json
{
	"address": ""
}

- /api/token recibe un objeto JSON . Se encarga de refrescar el token jwt de acceso.
```json
{
	"address": ""
}
```