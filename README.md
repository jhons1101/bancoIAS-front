# BancoIASFront

Este proyecto fue generado usando [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

Para iniciar el entorno local, ejecutar:

```bash
ng serve
```

Si al momento de ejecutar el comando ng serve se presenta un error de policies execption, debemos ejecutar este comando "ng.cmd serve". desde dentro de la carpeta del proyecto.
Debemos revisar estar dentro de la carpeta en donde se hizo el git clone.

## Code scaffolding
```bash
  ng : No se puede cargar el archivo C:\Users\myuser\AppData\Roaming\npm\ng.ps1 porque la ejecución de scripts está deshabilitada en este sistema. Para obtener más información, consulta el tema about_Execution_Policies en 
https:/go.microsoft.com/fwlink/?LinkID=135170.
En línea: 1 Carácter: 1
+ ng serve
+ ~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

Después de ello, ir al sitio web.
```bash
http://localhost:4200
```

Una vez que el servidor esté en funcionamiento, La aplicación requiere que esté desplegado el Backend local, las solicitudes a la API serán dirigidas a `http://localhost:8080`. Asegúrate de que el backend se ejecute en el **puerto 8080**. Esto evita las restricciones CORS del navegador para el desarrollo local.
