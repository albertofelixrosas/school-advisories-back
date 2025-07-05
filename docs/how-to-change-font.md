# Cambiar la fuente (`font`) de una imagen `.svg`

1. Cambiar el archivo de `.svg` a `.txt`
2. Abrir el archivo con Visual Studio Code
3. Localizar la etiqueta `<defs/>` y cambiarla por `<defs></defs>`
4. Introducir `<style type="text/css"></style>` debtri de `<defs></defs>`
5. Introducir la font que quieres agregar en base 64, como de la siguiente manera:

```txt
@font-face {
    font-family: 'Roboto';
    src: url(data:font/woff;base64,<fuente-en-base-64>) format('woff');
}
.roboto {
    font-family: 'Roboto';
    font-size: 13px;
}
```
> En caso de que quisieras aplicar la fuente en un lugar en particular, usar Visual Studio Code con el atajo `Ctrl + F` para poder localizar los lugares que quieres, y agregar, al igual que en HTML, la clase CSS mediante el atributo `font-family`, algo así como `font-family="<tu-fuente>"`.

Puedes entrar a [products.aspose.ap](https://products.aspose.app/font/base64/woff) para poder convertir varios tipos de fuentes a su valor Base64 y así importar los archivos directamente a tu `.svg` para que tengan la fuente que deseas.