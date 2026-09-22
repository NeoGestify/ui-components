# Changelog

## 3.11.0

`TextArea` y `Loading` eran los dos únicos componentes que medían en otro
idioma. Ya no.

### Un solo vocabulario de tamaños

**Toda la librería usa `sm | md | lg`** —Button, Input, Select, Table, Badge,
Modal, Switch, Tabs y los demás—, **menos estos dos, que usaban `small |
medium | large`.** No es un detalle de estilo: quien escribe un formulario pone
`size="sm"` en el botón, lo repite en el campo de texto de al lado y no pasa
nada, porque `sm` no existía ahí y el componente se quedaba en su tamaño por
defecto. Un campo más alto que el resto de la fila, sin ningún error que lo
explique.

Ahora los dos entienden `sm`, `md` y `lg` (y `xl` en `Loading`, que no tiene
nombre viejo):

```tsx
<TextArea label="Notas" size="sm" />
<Loading size="lg" />
```

**Los nombres viejos siguen funcionando y no están en desuso a medias: son el
mismo tamaño con otro nombre.** `medium` es `md`, letra por letra el mismo
resultado, y hay una prueba que lo fija para que no se separen el día que
alguien cambie una de las dos tablas de clases. Nada que migrar: el código que
ya existe no se toca.

### `Table` ya no le pone scroll horizontal a la página entera

El contenedor con `overflow-x-auto` no estaba posicionado, así que **lo que se
coloca en absoluto dentro de la tabla no tomaba como referencia la tabla, sino
la página**. El caso real: una cabecera de columna con el rótulo en `sr-only`
—el «Acciones» de la columna de botones— se salía del contenedor, y con ella
aparecía una barra de scroll horizontal en toda la página, en un sitio donde
no había nada que desplazar. Ahora el contenedor es `relative` y lo de dentro
se queda dentro.

### Iconos: atributos SVG en el nombre que entiende JSX

Varios iconos traían `stroke-linecap`, `stroke-width` o `stroke-dasharray` con
guion, copiados tal cual del SVG original. En JSX el nombre es `strokeLinecap`,
`strokeWidth`, `strokeDasharray`. Se corrigieron los que quedaban.

## 3.10.2

### `ElementLibraryBuilder`: el lienzo crecía sin parar

La vista previa se dibujaba con un tamaño en píxeles sacado de medir su propio
contenedor. En flujo normal eso es un bucle: el `<svg>` estira la caja, el
`ResizeObserver` la mide más alta, el `<svg>` vuelve a crecer. Cada vuelta
sumaba unos píxeles y el taller se estiraba hasta miles de píxeles de alto.

Solo se libraba quien le diera al taller una altura definida desde fuera —el
showcase, con su `h-[650px]`—, así que no se veía aquí. Dentro de un modal que
crece con su contenido, que es como lo monta el plano del salón, se disparaba.

La vista previa pasa a estar fuera del flujo (`absolute inset-0`): ya no cuenta
para la altura de la caja que se mide, y esa altura la fijan `flex-1 min-h-56`
como estaba previsto. Además llena el hueco por CSS (`w-full h-full`), de modo
que en el primer pintado —cuando todavía no hay medida y valen las de reserva—
no aparece un lienzo de 320×240 rodeado de blanco.

El showcase monta ahora el taller **dos veces**: con altura fija y sin ella. El
segundo es el que reproduce el fallo.

## 3.10.1

`Progress` sabía decir «llevo el 62 %». Ahora sabe decir «hay 62 camisetas, el
mínimo son 20 y el máximo 80».

### Marcas fijas en `Progress`

**Antes la barra solo tenía dos números: el valor y el tope.** Servía para una
subida de archivo, donde el 100 % es la meta y no hay nada que señalar en medio.
No servía para una pantalla de stock, donde lo que importa no es cuánto llevas
sino **dónde caes**: un stock de 62 no significa nada sin el mínimo de 20 y el
máximo de 80 al lado. La única salida era poner tres barras, o escribir los
números debajo y dejar que cada quien los cruzara a ojo.

**Ahora la barra es una escala.** `marks` dibuja referencias fijas sobre la
pista —un mínimo, un objetivo, el máximo—, cada una con su raya y su etiqueta:

```tsx
<Progress
  label="Stock de camisetas"
  value={62}
  max={80}
  marks={[
    { value: 20, label: 'Mín. 20' },
    { value: 80, label: 'Máx. 80' },
  ]}
/>
```

**La cuenta del tope es de quien llama.** `Progress` recibe `max` ya calculado y
no lo toca: mientras el stock quepa, el tope es el máximo de inventario y su
marca cae en el 100 %; cuando el stock lo pasa, quien llama sube el tope al
propio stock, la barra se llena y el máximo se queda **dentro**, como una marca
interior que enseña por cuánto se ha pasado. Una marca fuera de `[0, max]` no se
dibuja, y eso es a propósito: recortarla al borde la pondría encima del 100 %
como si el tope fuera ella, justo en el momento en que ya no lo es. Que
desaparezca es la señal de que hay que subir `max`.

**Tres cosas que no salen a la primera**, y que están escritas en el código para
que nadie las vuelva a descubrir:

- La pista lleva `overflow-hidden`. Una raya metida dentro se recorta a la mitad
  justo en el 100 % —donde cae el máximo mientras no se supere— y desaparece del
  todo en los extremos redondeados. Las marcas van **hermanas** de la pista,
  dentro de un envoltorio que no recorta.
- La raya tiene que verse sobre el relleno **y** sobre la pista vacía, que son
  dos colores distintos. Son 2 px de tinta con un halo de 2 px del color de la
  superficie; sin el halo se pierde contra el relleno, que en casi todas las
  variantes es igual de oscuro que el texto.
- Una etiqueta centrada en el 2 % se sale por la izquierda del componente. Van
  centradas bajo su marca, salvo por debajo del 6 % y por encima del 94 %, donde
  se anclan al borde.

Las rayas son `aria-hidden` y quien habla es la fila de etiquetas. Una marca sin
etiqueta visible puede decir lo suyo con `description`, que entra en un
`sr-only`; con las dos se anunciaría la misma marca dos veces, así que
`description` solo se lee cuando no hay `label`.

### Tramos de color

**El relleno era de un solo color de punta a punta.** Para que la barra cambiara
de color al cruzar el mínimo había que cambiarle la `variant` completa, y
entonces cambiaba *toda*: se perdía la información de por dónde se había pasado.

Ahora cada marca dice con `fill` **con qué color llega el relleno hasta ella**,
y tiñe el tramo que termina ahí —desde la marca anterior, o desde 0 si es la
primera—. Lo que importa es que los tramos **se encadenan**: un color a solas se
engancha al color con el que se quedó la marca anterior, así que una escala se
escribe con un color por banderín y las transiciones salen solas.

```tsx
marks={[
  { value: 20, label: 'Mín.', fill: 'var(--nui-danger)' },
  { value: 80, label: 'Máx.', fill: 'var(--nui-success)' },
]}
```

Eso son tres tramos: rojo plano hasta el mínimo —que no tiene de dónde venir—,
un degradado del rojo al verde del mínimo al máximo, y del máximo al tope el
color de la variante, porque ahí ya no manda ningún banderín.

Las dos escapatorias:

- **`[desde, hasta]`** fija el arranque pase lo que pase. Es la forma de cortar
  con el color anterior —queda una línea limpia en la marca que los separa— o de
  pintar un tramo de un color plano, poniendo el mismo color dos veces.
- **Sin `fill`**, el tramo se queda con el color de la variante, y además rompe
  la cadena: la marca siguiente ya no tiene color del que venir. Es a propósito.
  Venir de un tramo transparente desteñiría el color de la variante, que es
  justo lo que un tramo sin `fill` quiere dejar quieto.

Los tramos están clavados a la **pista**, no al relleno, así que un corte en el
20 % sigue en el 20 % mientras el valor crece; no se arrastra con la barra.

### `over`, el naranja

**`variant="over"` para el valor que se ha salido de su escala.** No reusa
`warning`: `warning` es amarillo y en una pantalla de stock ya significa «por
debajo del mínimo». Pasarse del máximo es el estado siguiente, y dos estados
distintos no pueden salir del mismo color. Es un token como los demás
(`--nui-over` / `--nui-over-dark`, orange-600 / orange-500 por defecto), así que
se retematiza declarando la variable.

### Props nuevas, todas opcionales

Sin `marks`, `Progress` se comporta y se ve exactamente como en la 3.10.

| Prop | Qué hace |
| --- | --- |
| `marks` | Referencias fijas sobre la barra, en las unidades de `value`. |
| `marks[].value` | Dónde cae, en unidades de `value`. Fuera de `[0, max]` no se dibuja. |
| `marks[].label` | Lo que va debajo de la raya. Sin ella, la marca es solo la raya. |
| `marks[].description` | Lo que lee el lector de pantalla cuando la marca no lleva etiqueta. |
| `marks[].fill` | Con qué color llega el relleno a esta marca. Uno se engancha al de la marca anterior; `[desde, hasta]` fija el arranque; nada deja el de la variante. |
| `variant="over"` | Relleno naranja para el valor que se ha pasado del tope. |

Se exportan el tipo `ProgressMark` y el token `over`. El cálculo de las marcas
visibles, del degradado de los tramos y de la posición de las etiquetas sale a
funciones puras con sus pruebas (`visibleMarks`, `segmentGradient`, `fillStyle`,
`markLabelPosition`).

## 3.10.0

El constructor de librerías, rehecho: ahora se ve lo que se dibuja y lo que sale
puede volver al mapa sin pasar por la carpeta de descargas.

### `ElementLibraryBuilder`

**Se ve la pieza.** Antes se escribían ancho, alto y dos colores a ciegas: la
única vista previa era la de la imagen incrustada. Ahora la pieza se dibuja en
grande sobre la rejilla de 20 px del editor, con las mismas formas y los mismos
ayudantes que `ElementNode` (`arrowPath`, `parseSvgMarkup`, `sanitizeImageSrc`),
así que lo que se ve es lo que se coloca. Cada pieza de la lista también se
enseña dibujada, en vez de como `shape_1 (rect)`.

**Se acabó «Save Changes to Element».** Era el fallo de fondo: el formulario
editaba una copia y, si se saltaba a otra pieza sin pulsar el botón, lo escrito
se perdía sin avisar. Ya no hay copia ni botón — cada cambio entra en la
librería— y el estado se cuenta en la barra: «Sin guardar» mientras haya algo
que mandar, «Guardado» después.

**Props nuevas, todas opcionales.** Sin ninguna se comporta como hasta ahora:

| Prop | Qué hace |
| --- | --- |
| `librerias` | Con qué abre. Se lee al montar, como `initialMap`. |
| `onGuardar` | Saca el botón «Usar en el plano» y devuelve el `ElementLibrary`. |
| `onCerrar` | Saca el botón «Cerrar» en la propia barra. |
| `titulo` | «Piezas del plano», «Piezas del salón»… |
| `nombreArchivo` | Nombre del `.json` que se descarga. |

Con `onGuardar`, quien abre el taller recibe las librerías y las guarda donde
quiera —dentro del mapa, por ejemplo—. Sin él, el recorrido sigue siendo
descargar el archivo e importarlo con «Importar librería».

**Se puede abrir una librería.** «Abrir…» lee un `.json` de los que exporta el
propio taller y lo suma a lo que haya, sustituyendo las del mismo nombre. Si el
archivo no sirve, se dice qué le falta —«no trae ninguna librería», «la librería
"x" no trae piezas»— en lugar del `Unexpected token` del `JSON.parse`.

**Borrar perdona.** Las «x» de 16 px que borraban sin preguntar son ahora un
botón de tamaño normal y un aviso con «Deshacer» que dura ocho segundos. La
papelera solo sale en la librería abierta: la de al lado era la que se pulsaba
sin querer.

**En español y con las palabras de la tarea.** *Libraries (Groups)*, *Element
Editor*, *Element ID (unique)*, *Shape*, *Fill Rule*, *Output JSON* pasan a
librerías, piezas, nombre, forma, relleno, borde y tamaño. El identificador ya
no se escribe: sale del nombre («Puesto de carro» → `puesto_de_carro`), se
mantiene único dentro de su librería y solo se toca si alguien lo pide con
«cambiar» —y entonces deja de seguir al nombre—.

**Tamaño de dedo.** Botones de 44 px, piezas de 96, el número del tamaño con su
menos y su más a los lados, y la forma como seis fichas dibujadas en vez de un
`<select>`. El JSON, que ocupaba un tercio del ancho, se despliega solo cuando
se pide.

**Por dentro.** El archivo de 596 líneas queda repartido en `builder.tsx`,
`ListaPiezas`, `PanelPieza`, `VistaPrevia` y `piezas.ts` (los ayudantes puros,
con sus pruebas). `arrowPath` se muda a `VenueMapEditor/utils/shapePath.ts`,
que ahora comparten el mapa y la vista previa.

El JSON que produce es idéntico al de la 3.9: una librería hecha con la versión
anterior se abre, se edita y se guarda sin conversiones.

## 3.9.0

Dieciséis componentes nuevos, los cinco fallos de `Table` y una capa de
primitivas para que dejen de estar copiadas seis veces.

### Los fallos de `Table`

**`rounded` mataba el scroll horizontal.** El envoltorio se construía con
`cn('overflow-x-auto w-full', rounded && 'rounded-lg overflow-hidden')`, y
`twMerge` mete `overflow-x-auto` y `overflow-hidden` en el mismo grupo: ganaba
el último. Una tabla ancha y redondeada se quedaba **recortada sin manera de
desplazarla**. El arreglo es que redondear no necesita recortar — un contenedor
con `overflow` distinto de `visible` ya recorta por sus esquinas—, así que ahora
solo se añade `rounded-lg`. Hay una prueba de regresión que fija las dos mitades
del comportamiento.

**La cabecera ordenable no se podía pulsar con el teclado.** Era un `<th>` con
`onClick`: sin foco, sin `Intro`, sin `aria-sort`. Ahora el contenido va dentro
de un `<button>` de verdad y el `<th>` expone `aria-sort` (`ascending` /
`descending` / `none`), que es lo que anuncia por qué columna va ordenada la
tabla a quien no ve la flecha.

De paso: la hoja de estilos del navegador pone `text-transform: none` a **todo**
`<button>` y ninguna variante de Tailwind lo hereda de vuelta, así que la única
cabecera con botón se quedaba sin las mayúsculas de las demás. Lleva
`[text-transform:inherit]`.

**`onRowClick` tampoco.** La fila pulsable ahora recibe foco, responde a `Intro`
y `Espacio`, y se marca con `role="button"`. Su aro de foco va con `outline` y
no con `box-shadow`: el navegador no pinta sombras en cajas `table-row`, así que
`focusVisibleRing` era invisible ahí. Se exporta el token nuevo,
`focusVisibleOutline`.

**`tableClassName` no podía ganar.** Era el único sitio de la librería que
concatenaba a mano en vez de pasar por `cn()`.

**`stickyHeader` no pegaba nada.** `overflow-x-auto` convierte el envoltorio en
contenedor de scroll en **los dos ejes**, así que sin altura no hay scroll
vertical del que pegarse. Ahora hay `maxHeight`, y está dicho en la
documentación de la prop.

### `DataTable`

`Table` recibe `ReactNode[][]` y no sabe qué hay dentro: no puede ordenar, ni
filtrar, ni saber qué fila está marcada. `DataTable` trabaja sobre los
registros y de ahí salen la ordenación (tres estados: sube, baja y vuelve al
orden original), la búsqueda, la paginación y la selección. Dibuja con `Table`,
busca con `Input`, pagina con `Pagination` y marca con `Checkbox`.

La comparación por defecto ordena «Artículo 2» antes que «Artículo 10», iguala
mayúsculas y acentos, entiende fechas y booleanos, y manda los vacíos al final
suba o baje el orden: una celda sin dato no es «lo más pequeño», es que no hay
dato.

`getRowId` es obligatorio a propósito. Con la posición como identidad, ordenar o
cambiar de página reutiliza el `<tr>` de la fila N para otro registro y la
selección deja de significar nada.

Con `manual` se apaga todo el trabajo en memoria, para cuando ordena y pagina el
servidor.

### Componentes nuevos

| | |
|---|---|
| `Checkbox`, `Radio` | Sueltos. Antes un «acepto los términos» obligaba a un grupo de una sola opción. Ahora los grupos se construyen con ellos, no al revés |
| `NumberInput` | No es un `input type="number"`: la rueda del ratón no cambia el valor al pasar por encima, y la coma vale como separador decimal |
| `Slider` | Un `input type="range"` de verdad por dentro; solo cambia la pintura |
| `TagInput` | Valores que no salen de una lista. `⌫` sobre el campo vacío borra la última; al pegar una columna sale una etiqueta por línea |
| `FileDropzone` | El `<input type="file">` sigue ahí, oculto pero enfocable, y su `FileList` se mantiene sincronizada con un `DataTransfer` para que `name` envíe lo que de verdad se ve |
| `Rating` | Grupo de opciones excluyentes, no un adorno. En `readOnly` deja de ser un control y pasa a ser imagen con texto |
| `ToggleGroup` | Barra de herramientas: varios activos a la vez y botones de solo icono |
| `Stepper` | Un `<ol>` de verdad, así que se anuncia «3 de 4» sin escribirlo |
| `Collapsible` | El acordeón de uno solo. `Accordion` ahora usa su misma región plegable |
| `Timeline` | Historial de sucesos |
| `Tree` | Patrón `tree` de ARIA: una parada de tabulación y flechas por dentro |
| `ScrollArea` | Barra nativa, solo repintada. Reimplementarla rompe el desplazamiento al llegar con el tabulador a algo fuera de la vista |
| `CommandPalette` | El buscador de ⌘K, montado sobre `Modal` |
| `Field` | El envoltorio de etiqueta, error y ayuda |
| `DataTable` | Arriba |

### `Field`: se acabó copiarlo seis veces

Etiqueta, error, texto de ayuda y los `aria-describedby` estaban reimplementados
en `Input`, `TextArea`, `Select`, `Combobox`, `DatePicker` y el constructor de
elementos, cada uno con su propia versión de los identificadores. Un fallo de
accesibilidad había que arreglarlo seis veces. Ahora hay un componente y dos
ayudantes —`useFieldIds` y `describedBy`—, y los seis campos pasan por ellos.

`Field` también sirve para envolver un control ajeno y que herede el mismo
aspecto.

### Un solo tipo de opción

`SelectOption`, `ComboboxOption`, `RadioOption`, `CheckboxOption` y
`SegmentedOption` eran casi idénticos e **incompatibles en TypeScript**: quien
tuviera un arreglo preparado para un `RadioGroup` no podía pasárselo a un
`SegmentedControl` sin mapearlo. Todos son ahora alias de `NuiOption`.

`Select` y `Combobox` estrechan la etiqueta a `string`, porque una va dentro de
una `<option>` nativa y la otra es el texto sobre el que se busca.

Y los componentes de opciones aceptan la lista abreviada:

```tsx
<RadioGroup options={['S', 'M', 'L']} />
```

### Las primitivas salen de `internal/`

Nuevo subcamino `neogestify-ui-components/hooks` con `useControllableState`,
`useDismiss`, `useScrollLock`, `useAnchoredPosition`, `computePosition`,
`Portal`, `mergeRefs`, `useMergedRefs`, `inertOutside` y `pushTopLayer`.

Quien montaba un componente propio sobre la librería tenía que reescribirlos, y
reescribirlos peor: cada uno guarda la solución a un fallo concreto que ya se
pagó una vez.

### `Modal` gana tres props

`header` sustituye la cabecera entera (con `aria-label` en su lugar), `align`
la pega arriba y `bodyClassName` quita el relleno del cuerpo. Son lo que
permite montar `CommandPalette` encima sin reescribir la capa, el velo, el
bloqueo del desplazamiento ni el foco.

### Un fallo en `Tree`, encontrado probándolo

Los nodos van anidados, así que el `<li>` de un hijo está **dentro** del `<li>`
de su padre y un `keydown` sube por todos ellos. La flecha izquierda sobre una
rama la cerraba y acto seguido cerraba a su padre, a su abuelo y hasta la raíz,
dejando el foco en la nada. Se corta la propagación entre nodos.

Y al pulsar con el ratón el foco se queda en el botón interior, que está fuera
del recorrido, así que las flechas seguían moviéndose desde el nodo anterior.
Ahora vuelve al nodo pulsado.

### Otros

- Siete textos nuevos en `NuiConfigProvider`: `increment`, `decrement`,
  `remove`, `search`, `dropFiles`, `expand`, `collapse`.
- 40 pruebas nuevas (80 en total), todas sobre las funciones puras nuevas y la
  regresión de `overflow` de `Table`.
- Cuatro demos nuevas en el showcase: campos de formulario, tablas, estructura
  y navegación.

## 3.8.0

Vuelve `zIndex`, y con él sale a la luz un fallo que llevaba desde la 3.6.0.

### El fallo: las capas flotantes desaparecían dentro de un modal

`Dropdown`, `Combobox`, `Popover` y `Tooltip` se portalizaban a `document.body`
con `z-index` 60–80. Un `<dialog>` abierto con `showModal()` vive en la *top
layer*, que se pinta por encima de **todo** el documento al margen de cualquier
`z-index`. Resultado: abrir un desplegable dentro de un `Modal` o un `Drawer` lo
dejaba **detrás del propio diálogo**. La lista existía, respondía al teclado y
no se veía.

Se comprobó con el `Combobox` que el showcase tiene dentro del cajón:
`aria-expanded="true"`, diez opciones en el DOM, cero píxeles en pantalla.

Ahora hay un registro de los diálogos abiertos y `Portal` cuelga la capa
flotante **dentro** del diálogo activo, que ya está en la top layer.

`Toast` es la excepción a propósito: se queda en `<body>` y se sube con la API
de *popover*. Portalizado dentro del modal, un «guardado con éxito» lanzado
desde un formulario moriría al cerrar ese modal — justo cuando hay que leerlo.

### `zIndex`, otra vez, y esta vez sirviendo para algo

Estaba marcada como obsoleta desde la 3.0.4 porque en la top layer un `z-index`
es literalmente inerte. Ahora funciona, saliéndose de esa capa:

```tsx
<Modal zIndex={40} … />   // y tu elemento a z-50 queda por encima
```

Pasar `zIndex` implica `topLayer={false}`, que es el comportamiento anterior a
la 3.0.4. **La modalidad no se pierde**: la librería marca `inert` el resto de
`<body>` a mano, lo que cubre foco, puntero y árbol de accesibilidad — más de lo
que conseguía la trampa de foco casera que se borró entonces.

Para que el `inert` pueda marcar a sus hermanos, en este modo el diálogo se
portaliza a `<body>`; enterrado en el árbol de la aplicación, su propio
contenedor lo contendría y no se podría marcar nada.

Con `topLayer={false}` y sin dar valor, se apila en `NUI_LAYERS.modal` (50), por
debajo de los menús y los avisos de la propia librería. Se exporta la escala
entera: modal 50, popover 60, tooltip 70, toast 80.

`Drawer` gana las mismas dos props.

### Y un tercer fallo de camino

El efecto de apertura leía el `<dialog>` de una ref. Con `topLayer={false}` el
diálogo vive en un portal, que no monta hasta su propio efecto, así que la ref
valía `null` y **el diálogo no llegaba a abrirse**. Igual que el Escape, que
enganchaba su listener a la nada. Ambos efectos esperan ahora al nodo.

### En el showcase

La sección de movimiento gana un banco de pruebas: dos campos para el `z-index`
del modal y el de una banda ajena a la librería, y un interruptor para la top
layer. Se ve al momento quién queda encima.

## 3.7.0

La duración y el desenfoque pasan a ser configurables, por la misma vía que los
colores.

Hasta ahora la duración solo se podía encender o apagar (`applyMotion(false)`,
`animate={false}`) y el desenfoque estaba quemado en `backdrop-blur-sm`.

### Tres variables

| Variable | Por defecto | Qué controla |
| --- | --- | --- |
| `--nui-duration` | `200ms` | Transiciones normales |
| `--nui-duration-fast` | `120ms` | Gestos cortos (tooltip, menú) |
| `--nui-blur` | `8px` | Desenfoque del velo de modales y cajones |

### Tres formas de tocarlas

```css
:root { --nui-duration: 320ms; --nui-blur: 0px }
```

```tsx
applyMotion({ duration: 320, blur: 12 });   // devuelve una función que deshace
<ThemeProvider motion={{ duration: 320, blur: 12 }}>
```

```tsx
<Modal animate={400} />                  // solo este, 400 ms
<Drawer blur={false} />                  // sin desenfoque
<Drawer blur={20} animate={{ duration: 500 }} />
```

`animate` pasa de `boolean` a `boolean | number | MotionOptions`, y `Modal` y
`Drawer` ganan una prop `blur`. Todo lo anterior sigue compilando igual.

Un número suelto en `animate` ajusta **las dos** duraciones manteniendo la
proporción 120/200 que traen por defecto: si no, un valor alto dejaría los
tooltips tan lentos como un modal.

`blur={false}` se resuelve a `blur(0px)` y no a `none` a propósito — `none` no
es interpolable, así que el velo dejaría de animarse en vez de animarse hacia
nada.

### También

- `motionBlur()` para leer el desenfoque efectivo, junto al `motionDuration()`
  que ya existía.
- `motionToCss()` acepta ajustes además de un booleano, para inyectarlos desde
  el servidor.
- `applyMotion(true)` limpia las variables y vuelve a los valores por defecto.
- Los velos de `Loading` y de la hoja móvil del `DatePicker` también leen la
  variable, así que un solo mando los gobierna todos.
- Sección «Movimiento configurable» en el showcase para probarlo en vivo.

## 3.6.4

El desenfoque del fondo ahora entra fundiéndose.

### El problema

El velo de `Modal` y `Drawer` llevaba `backdrop-blur-sm` fijo y solo animaba la
opacidad:

```
transition-property: opacity        ← lo que había
backdrop-filter: blur(8px)          ← constante desde el primer frame
```

Y resulta que **Chrome aplica `backdrop-filter` a plena potencia aunque el
elemento esté a `opacity: 0`**: el filtro se resuelve sobre el fondo antes de
componer la opacidad. Así que el tinte entraba fundiéndose, sí, pero el fondo
aparecía desenfocado de golpe en el primer frame. Medido: opacidad `0.00` con el
desenfoque ya en `blur(8px)`.

### El cambio

Se anima el filtro en sí. Nuevo token `motion.scrim`:

```
transition-[opacity,backdrop-filter]
opacity-0 backdrop-blur-[0px]   →   opacity-100 backdrop-blur-sm
```

Se interpola desde `blur(0px)` y no desde `none` a propósito: `none` no es un
valor interpolable y la transición no llegaría a arrancar.

### Nota de método

Las mediciones desde automatización daban valores estáticos y engañosos porque
**el reloj de animación de una pestaña que no está componiendo se congela**:
`getAnimations()` devolvía las transiciones en `running` pero con
`currentTime: 0` medio segundo después de arrancar. Lo que se comprueba de
verdad es la lista de propiedades en transición y el valor del estado inicial.

## 3.6.3

Las animaciones de entrada no se ejecutaban. Tres causas distintas, todas
invisibles para el compilador.

### 1. El estilo de partida nunca se calculaba

`Modal` y `Drawer` hacían esto al abrirse:

```js
dialog.showModal();   // pasa de display:none a visible
setShow(true);        // …y en el MISMO commit lo pone en su sitio
```

Una transición necesita dos estilos calculados entre los que interpolar. Aquí el
navegador nunca llegaba a resolver el estado de partida —el panel desplazado
fuera, el modal a `scale-95`— así que saltaba directamente al final. Lo único
que se veía era el fundido del diálogo, idéntico para los cuatro lados: de ahí
la sensación de que todos usaban la misma animación.

Se arregla forzando un reflujo (`void dialog.offsetHeight`) entre las dos cosas.

### 2. `overflow-hidden` convertía el diálogo en contenedor desplazable

El arreglo de la 3.6.2 recortaba el panel, sí, pero `hidden` **crea un
contenedor de desplazamiento**. Al abrir, el navegador lleva el foco dentro y
desplaza ese contenedor para hacer visible el panel, que estaba fuera. Ese salto
era el «parpadea y aparece».

Solo ocurría en `right` y `bottom`: hacia el lado positivo hay desbordamiento
alcanzable, mientras que `left` y `top` el navegador los recorta sin más. Por
eso el cajón de la izquierda se veía bien y los otros dos no.

`overflow-clip` recorta igual pero no crea contenedor de desplazamiento, así que
no hay nada que el navegador pueda mover.

### 3. `motion.enter` no cubría las propiedades que cambiaban

```
transition-[opacity,transform]     ← antes
```

Tailwind 4 dejó de meterlo todo en `transform`: `scale-95` escribe la propiedad
**`scale`** y `translate-x-full` la propiedad **`translate`**. La transición
listaba `transform`, que ya no es la que cambia, así que el modal se desvanecía
pero su escala saltaba de golpe.

Ahora es `transition-[opacity,transform,translate,scale,rotate]`. Afecta a
`Modal`, `Popover`, `Tooltip` y `Toast`.

### Y el velo entra fundiéndose

El `<dialog>` llevaba su propio `opacity-0 → 100` **encima** del velo, así que el
panel se desvanecía a la vez que se deslizaba y el desenfoque aparecía de golpe
con él. El diálogo ya no se atenúa: el velo se funde y el panel se desliza, cada
uno lo suyo.

## 3.6.2

`Drawer`: la barra de desplazamiento que aparecía y se iba sola.

### El problema

Un `<dialog>` trae `overflow: auto` del navegador. El panel del cajón arranca
desplazado un 100 % **fuera** del diálogo para poder entrar deslizándose, y ese
trozo que sobresale cuenta como desbordamiento desplazable: el diálogo pintaba
una barra durante la animación de entrada, y otra al cerrarse.

Se veía en los cajones de la izquierda y de abajo, no en el de la derecha — un
desplazamiento hacia la derecha o hacia abajo genera desbordamiento alcanzable,
y por eso saltaba la barra; hacia la izquierda el navegador lo recorta.

Medido con el cajón abierto: **384 px** de desbordamiento horizontal, justo el
ancho del panel.

### El cambio

`overflow-hidden` en el `<dialog>`. El desplazamiento del contenido vive en el
`<div>` interior del panel, así que recortar ahí no quita nada.

### De paso: las tallas verticales

`sm`/`md`/`lg`/`xl` para `top` y `bottom` eran las mismas medidas que los anchos
laterales, y no se comportan igual: en un panel lateral la cabecera y el pie se
reparten el alto de la pantalla y no se notan, pero en uno horizontal se comen
un trozo fijo de unos 115 px. Con `h-64` como talla media quedaban ~140 px
útiles y cualquier formulario salía ya con su propia barra.

La escala vertical pasa a `h-56` / `22rem` / `30rem` / `38rem`.

## 3.6.1

Integración continua. No cambia nada de lo que se publica.

No había ninguna. Ahora se comprueban tipos, linter y pruebas en cada empujón, y
el empaquetado verifica dos cosas que ya se han roto una vez y que **compilan
perfectamente estando mal**:

- Que `"use client"` es la **primera** sentencia de los ficheros de `dist`. Una
  directiva fuera del prólogo del módulo es una expresión muerta que nadie ve.
- Que `theme/` **no** la lleva: `nuiColorsToCss()` y `motionToCss()` existen
  para llamarse desde el servidor.

## 3.6.0

Búsqueda, paneles laterales y las piezas pequeñas.

### `Combobox`

`Select` envuelve el `<select>` nativo, que no busca ni admite selección
múltiple usable. Este lo sustituye cuando la lista pasa de una docena de
opciones — para tres o cuatro sigue siendo mejor el nativo, que en móvil abre la
rueda del sistema.

```tsx
<Combobox label="País" options={paises} value={pais} onChange={setPais} />
<Combobox multiple label="Etiquetas" options={etiquetas} value={activas} onChange={setActivas} />
```

- **El filtro ignora acentos**: escribir «peru» encuentra «Perú». Busca también
  en `description`, no solo en la etiqueta.
- Opciones agrupadas por `group`, conservando el orden en que llegan.
- En el múltiple, fichas con `maxTags` y resumen «+N», y <kbd>⌫</kbd> con el
  campo vacío quita la última — como cualquier campo de etiquetas.

Sigue el patrón ARIA de `combobox`: **el foco no se mueve a la lista**, se dice
cuál está resaltada con `aria-activedescendant`. Si el foco saltara, dejaría de
poder escribirse, que es el punto entero del componente.

Las opciones responden a `pointerdown` y no a `click`: el `click` llega después
del `blur` del campo, que ya habría cerrado la lista.

### `Drawer`

Panel que entra desde cualquier borde. Es un `<dialog>` con `showModal()`, igual
que `Modal`, así que hereda lo mismo del navegador: *top layer*, foco atrapado
de verdad, resto de la página `inert` y foco devuelto al cerrar.

El velo va en un elemento aparte del panel; si fuera el fondo del `<dialog>`, el
panel heredaría su transparencia.

### `Divider`, `EmptyState`, `Stat`, `Kbd`

Las que cada aplicación acababa reescribiendo.

`Stat` colorea el `delta` por su signo, con `invertDelta` para las métricas
donde bajar es lo bueno: un −8 % en costes es verde, no rojo. `EmptyState`
lleva `action` porque una lista vacía sin salida es un callejón — y sin él es
indistinguible de una que no ha cargado.

### En el showcase

Sección «Selección y composición» con los seis.

## 3.5.0

Avisos propios y los grupos de formulario que faltaban.

### `ToastProvider` / `useToast`

Notificaciones efímeras sin pasar por SweetAlert, que hasta ahora era la única
forma de avisar de algo y arrastraba un peer completo al camino crítico.

```tsx
<ToastProvider position="bottom-right">
  <App />
</ToastProvider>

const { toast } = useToast();
toast({ title: 'Guardado', variant: 'success' });
toast({
  title: 'Registro eliminado',
  action: { label: 'Deshacer', onClick: restaurar },
  duration: 8000,
});
```

Dos decisiones que se notan al usarlo:

- **El temporizador se pausa** mientras el ratón está encima o algo dentro tiene
  el foco. Sin eso, un aviso con «Deshacer» desaparece justo cuando vas a
  pulsarlo.
- **`limit` (4 por defecto)** retira el más antiguo al desbordarse. Una pila sin
  tope acaba tapando la aplicación.

`role="alert"` solo en la variante `danger` —que interrumpe al lector de
pantalla— y `role="status"` en el resto. El contenedor es
`pointer-events-none` y cada aviso `auto`: la región ocupa una franja entera de
la pantalla y sin eso bloquearía los clics de todo lo que tiene debajo.

### `RadioGroup`

Un `Input type="radio"` suelto no forma un grupo: no comparte etiqueta, no
expone `role="radiogroup"` y el tabulador para en **cada** círculo. Ahora el
grupo es una sola parada de tabulación, dentro se mueve con las flechas y mover
el foco selecciona — como el nativo.

Con `variant="card"`, `orientation`, `description` por opción, y `error`
asociado al grupo entero.

### `CheckboxGroup`

Lo mismo para las casillas, más `selectAllLabel`: una casilla de cabecera con
**estado intermedio de verdad** (`aria-checked="mixed"`), no un sí/no que
miente cuando hay media selección. Respeta las opciones deshabilitadas: marcar
«todas» no toca lo que el usuario no puede tocar.

### `SegmentedControl`

Selector de pocas opciones, todas visibles. Es un `radiogroup`, no unas
pestañas: cambia un **valor**, no la vista. La pastilla se mide del botón activo
y se desliza en vez de saltar.

### En el showcase

Sección «Controles y avisos» con los cuatro, y la sección «Capas flotantes» de
la versión anterior. La aplicación de ejemplo va envuelta en `ToastProvider`.

## 3.4.0

`Dropdown` y `Popover`, y tres fallos que solo aparecieron al probarlos en un
navegador de verdad. Dos de ellos los había metido yo en 3.2.0 y 3.3.0.

### `Dropdown`

Menú de acciones anclado a un botón, con el teclado completo: flechas, Inicio,
Fin, Escape, Tab para cerrar y **escritura rápida** (teclear «el» salta a
«Eliminar», con el corte de un segundo que usa un `<select>` nativo).

```tsx
<Dropdown
  trigger={<Button variant="icon"><MenuIcon /></Button>}
  items={[
    { id: 'edit', label: 'Editar', icon: <EditIcon />, shortcut: '⌘E' },
    { id: 'del',  label: 'Eliminar', danger: true, separatorBefore: true },
  ]}
  onSelect={id => …}
/>
```

El foco no viaja con Tab entre los elementos: un menú es **una sola** parada de
tabulación y dentro se navega con flechas, que es lo que espera un lector de
pantalla al encontrarse un `role="menu"`.

### `Popover`

La capa flotante genérica: se abre al pulsar y admite el foco dentro, así que
puede llevar campos y botones. Cierra al pulsar fuera o con Escape, y devuelve
el foco al disparador.

### Corrección: `cn()` se comía las clases de tamaño (regresión de 3.2.0)

La grave. `tailwind-merge` no puede adivinar el tipo de un valor arbitrario:
`border-[var(--x)]` tanto podría ser un color como un grosor, y `text-[var(--x)]`
un color o un tamaño de letra. Elegía grosor y tamaño — que es lo contrario de
lo que son todos los tokens de esta librería — así que:

```ts
cn('border', border.subtle)   // → se quedaba SIN `border`: 0px de borde
cn('text-sm', text.base)      // → se quedaba SIN `text-sm`
```

Se veía a simple vista: el panel del `Popover` salía sin borde ninguno.

Arreglado en el origen, anotando el tipo en los 112 valores arbitrarios de
color: `border-[color:var(--x)]`. Es sintaxis estándar de Tailwind (3.0+), no
cambia ni un píxel del CSS generado, y ahora `tailwind-merge` los clasifica
bien. Hay pruebas de regresión que fallan si alguien quita la anotación.

### Corrección: bucle de render en las capas flotantes

`mergeRefs()` devuelve una función nueva en cada render. React compara esa
función entre renders y, si cambia, llama a la ref con `null` y luego otra vez
con el nodo. Cuando una de las refs unidas es un `setState` —como pasó al
guardar el panel en estado— el ciclo se cierra sobre sí mismo:

```
render → ref nueva → React reconecta → setState(null) → setState(nodo) → render → …
```

`Popover` y `Dropdown` renderizaban sin parar y el panel se quedaba congelado en
`opacity-0`: la animación de entrada se cancelaba en cada vuelta. Ahora hay
`useMergedRefs`, con identidad estable, y se usa también en `Input` y `TextArea`.

### Corrección: el portal llegaba tarde

El colocador recibía una **ref** al elemento flotante, pero ese elemento vive en
un `<Portal>` que no pinta hasta su propio efecto: en el render en que se abría,
la ref todavía valía `null`, el efecto no encontraba nada que medir y no volvía
a ejecutarse. Mismo origen del fallo por el que el foco no entraba en el menú.

`useAnchoredPosition` recibe ahora el **elemento**, no la ref, así que el render
en que aparece es el que lo mide.

### Linter con `react-hooks` y `jsx-a11y`

Solo estaban `eslint:recommended` y `@typescript-eslint`. Al añadir los dos
plugins salieron **18 errores de accesibilidad reales**, todos corregidos:

- `Card` con `interactive` era un `div` enfocable sin `role` ni teclado: llegabas
  a él con el tabulador y no había forma de activarlo. Ahora es `role="button"`
  con Enter y Espacio.
- En `ElementLibraryBuilder`, las filas de grupos y elementos se seleccionaban
  con un `onClick` sobre un `div`: inalcanzables con el teclado. Ahora son
  botones de verdad, sin anidar el de borrar dentro (que era HTML inválido).
- El velo y el asa de la hoja móvil del `DatePicker`, igual.
- `aria-invalid` en el disparador del `DatePicker`: no es un atributo válido en
  `role="button"`.
- Etiquetas `<label>` sin campo asociado en el editor de mapas.

Quedan 9 avisos de `exhaustive-deps` en `Calendar` y `EditorCanvas`, sin revisar
todavía. No rompen la compilación.

### Pruebas

Arranca la suite: `bun test`, con 21 pruebas sobre el colocador y sobre `cn()`.
Nuevos scripts: `bun run typecheck`, `bun run test` y `bun run check` (los tres
seguidos).

## 3.3.0

Una capa de primitivas debajo de los componentes, y los tres fallos que salieron
al escribirla.

### El tooltip ya no se sale de la pantalla

`Tooltip` calculaba su posición y ya está. Uno con `placement="top"` en la
primera fila de la página se salía por arriba, y uno ancho cerca del borde
derecho se cortaba.

Ahora hay un colocador de verdad (`computePosition`) que **voltea** al lado
contrario si no cabe y **desplaza** a lo largo del eje transversal para meterlo
en pantalla sin despegarlo de su anclaje. `placement` pasa a aceptar también
alineación: `'bottom-start'`, `'right-end'`…

De paso, el globo ya no aparece antes de saber dónde va: antes se pintaba una
fracción de segundo en la esquina y se le veía saltar a su sitio.

### Dos modales encimados ya no dejan la página bloqueada

El bloqueo de desplazamiento vivía dentro de `Modal` y guardaba el `overflow`
anterior en una variable local:

```ts
const previous = document.body.style.overflow;   // 'hidden' si ya había otro
document.body.style.overflow = 'hidden';
return () => { document.body.style.overflow = previous; };
```

Con un modal que abre un diálogo de confirmación, el segundo leía `'hidden'`
como valor «anterior» y al cerrarse lo restauraba. Se cerraba todo y la página
se quedaba sin poder desplazarse. `useScrollLock` lleva contador: guarda el
valor original al pasar de cero a uno y lo restaura al volver a cero. También
compensa el ancho de la barra, así que la página ya no da el salto lateral al
abrir un modal.

### `Table` acepta identidad de fila

```tsx
<Table rows={filas} getRowKey={i => usuarios[i].id} />
```

La `key` era el índice, y el índice no identifica una fila: al ordenar o
filtrar, React reutiliza el `<tr>` de la posición N para otro registro. Lo
visible se corrige al repintar, pero el estado que viva dentro de una celda —un
input a medio escribir, el foco— se queda en la fila equivocada.

`AccordionItem.id` tenía el mismo problema y ahora lo dice su documentación.

### Textos configurables

Los textos de la librería estaban en español y quemados en el código:
`'Cargando...'` en `Button`, `'Cerrar'` en `Modal`, `'Limpiar'` en `Input`,
`'Aceptar'`/`'Cancelar'` en los alerts.

```tsx
import { NuiConfigProvider, EN_MESSAGES } from 'neogestify-ui-components/config';

<NuiConfigProvider messages={EN_MESSAGES}>
  <App />
</NuiConfigProvider>
```

Se mezcla con lo que haya, así que se puede cambiar un solo texto, y los
proveedores se anidan. Las props sueltas (`loadingText`, `clearLabel`) siguen
ganando sobre el diccionario. Los alerts, que son funciones y no componentes, se
configuran una vez con `configureAlertas({ confirm: 'OK' })`.

Sin proveedor todo sigue exactamente igual que antes.

### Nuevas primitivas internas

- `useControllableState` — el patrón controlado/no controlado estaba copiado a
  mano en `Tabs`, `Accordion` y `Switch`. Además fija el modo al montar, en vez
  de recalcularlo en cada render.
- `useScrollLock`, `useDismiss` (clic fuera y Escape), `useAnchoredPosition`,
  `Portal`, `mergeRefs` y `computePosition`.

Son la base de los componentes flotantes que vienen después.

## 3.2.0

`className` por fin gana siempre.

### El problema

Toda la librería componía clases con `[...].filter(Boolean).join(' ')`, y el
comentario que acompañaba a la prop decía que las del consumidor «se añaden al
final, así que ganan». **Eso es falso.** Con la misma especificidad no gana la
que va última en el atributo, gana la que va última en la hoja de estilos que
genera Tailwind. Así que esto:

```tsx
<Button size="md" className="px-6" />   // px-3 del tamaño md + px-6
```

daba un resultado u otro según cómo hubiera ordenado Tailwind su CSS. Con dos
clases del mismo grupo peleando, el resultado era una lotería — y por eso a
veces «no me coge el padding» y a veces sí.

### El cambio

Entra `cn()`, sobre `tailwind-merge`: detecta que `px-6` y `px-3` son el mismo
grupo y deja solo la última. Está aplicada en **59 puntos** de 22 ficheros, que
son todos los sitios donde se mezclaban clases.

Entiende variantes y valores arbitrarios, que es de lo que están hechos los
tokens de esta librería:

```ts
cn('px-3 py-2', 'px-6')                            // → 'py-2 px-6'
cn('bg-[var(--nui-surface,#fff)]', 'bg-red-500')   // → 'bg-red-500'
cn('dark:bg-blue-500 bg-white', 'dark:bg-green-500')  // → 'bg-white dark:bg-green-500'
```

Acepta lo mismo que `clsx` — cadenas, arrays, condicionales y objetos:

```ts
cn('rounded-md', activo && 'ring-2', { 'opacity-50': disabled }, className)
```

### Se exporta

`cn` sale por el paquete raíz y por `./tokens`, para envolver componentes sin
volver a tener el problema:

```tsx
import { cn } from 'neogestify-ui-components';

const BotonGuardar = ({ className, ...props }) => (
  <Button className={cn('min-w-32', className)} {...props} />
);
```

Vive en `theme/` a propósito: `tailwind-merge` es manipulación de cadenas pura,
no toca el DOM, así que `cn` sigue siendo utilizable en el servidor.

### Nota

`tailwind-merge` pasa a ser la primera dependencia de runtime de la librería
(~7 KB comprimidos). No requiere que Tailwind esté instalado: si el proyecto no
lo usa, `cn` devuelve la misma cadena que devolvía antes.

## 3.1.0

Lo que hacía falta para poder consumir la librería desde fuera sin pelearse con
ella. Nada de esto cambia cómo se ve un componente; cambia si se puede usar.

### `"use client"`

Ningún fichero la llevaba. En el App Router de Next.js eso significa que
importar `Button`, `Modal` o `Tabs` desde un Server Component reventaba con
*«useState only works in a Client Component»*. Ahora la directiva se aplica en
`dist` después de compilar.

`theme/` (el subpath `./tokens`) queda **fuera** a propósito: `nuiColorsToCss()`
y `motionToCss()` existen precisamente para llamarse desde el servidor y
escupir el `<style>` que evita el parpadeo de color antes de hidratar.

Dos detalles del empaquetado que salieron de aquí y valen por sí solos:

- `treeshake: true` está desactivado. Esa opción añade una pasada de Rollup por
  encima de esbuild que **borra las directivas de módulo** — avisaba con
  *«Module level directives cause errors when bundled»* y se ignoraba.
- Las dos configuraciones de tsup corren en paralelo, así que `clean: true` en
  una borraba lo que la otra acababa de escribir. La limpieza pasó al script.

### `ref` en los campos de formulario

`Button`, `Input`, `Select` y `TextArea` pasan a `forwardRef`. Sin esto,
`react-hook-form` con `{...register('email')}` no funcionaba, no se podía
enfocar un campo tras validar ni medirlo. Antes solo `Modal` aceptaba `ref`.

### `<Button>` ya no envía el formulario sin querer

Faltaba el `type` por defecto, así que el navegador asumía `submit` y un
`<Button>Cancelar</Button>` dentro de un `<Form>` lo enviaba. Ahora es
`type="button"`; quien quiera enviar pone `type="submit"`.

### Tipos de props exportados

`InputProps`, `SelectProps`, `SelectOption`, `TextAreaProps`, `FormProps`,
`TableProps`, `ColumnDef`, `SortState` y `LoadingProps` eran `interface` sin
`export`. Justo los componentes que más se envuelven, y no se podía tipar el
envoltorio. `Option` sigue exportándose como alias obsoleto de `SelectOption`.

### El error ya se anuncia con su campo

`Input` y `TextArea` pintaban `<p role="alert">` sin `id` y sin
`aria-describedby`, así que un lector de pantalla leía el mensaje suelto sin
saber de qué campo era. Ahora va cableado, con `aria-invalid`, igual que ya
hacía `Select`.

### `clearable` funciona sin controlar el campo

La X exigía `value !== undefined`, así que en modo no controlado no aparecía
nunca. Ahora el componente vigila si hay contenido y, al limpiar, vacía el nodo
por el *setter* nativo y dispara un `input` real — asignar `el.value` a secas no
sirve: React recuerda el último valor que vio y no llamaría a `onChange`.

También: `aria-busy` mientras `isLoading`, y el texto del botón de limpiar es
configurable con `clearLabel`.

## 3.0.4

`Modal` pasa a ser un diálogo modal de verdad.

### El problema

Se abría con el atributo `open`, que crea un diálogo **no modal**: sin *top
layer*, sin `::backdrop` nativo y sin marcar el resto de la página como `inert`.
El `aria-modal="true"` que llevaba afirmaba algo que el DOM no cumplía. La
trampa de foco casera solo interceptaba el tabulador, así que un lector de
pantalla seguía paseándose por el contenido de detrás, y la página de fondo se
podía desplazar con el modal abierto.

### El cambio

Ahora se abre con `showModal()`. El navegador se encarga de atrapar el foco, de
devolverlo a quien abrió el modal, del velo y de dejar el fondo inerte — de
verdad, también para lectores de pantalla. Eso permitió **borrar la trampa de
foco manual entera** y el listener de Escape: 40 líneas menos de código que
imitaba a medias lo que el navegador ya hace.

- Se bloquea el desplazamiento de la página mientras está abierto.
- El Escape se reconduce por el evento nativo `cancel`, respetando `closeOnEsc`
  y conservando la animación de salida.
- El clic en el fondo sigue funcionando igual, con `closeOnBackdrop`.

### Un cambio que quizá te afecte

**`zIndex` deja de tener efecto.** La *top layer* está por encima de cualquier
`z-index` de la página, así que ya no hay nada que ajustar. La prop se sigue
aceptando y está marcada como obsoleta: el código existente compila igual.

Los valores por defecto no cambian: `closeOnEsc` y `closeOnBackdrop` siguen en
`false`, así que por defecto el modal solo se cierra por sus botones.

## 3.0.3

Deuda técnica: animaciones que no seguían al sistema, un temporizador suelto y
dependencias que sobraban.

### `sweetalert2` pasa a ser opcional

- **`sweetalert2-react-content` sale de las peer dependencies.** No lo importaba
  ni una línea de la librería; se estaba obligando a instalarlo a todo el mundo.
- `sweetalert2` queda como peer **opcional**: solo hace falta si usas las
  funciones `Alerta*` o `InfoAlert`. Quien solo quiera un `<Button>` ya no tiene
  que instalarlo.

Si tu gestor de paquetes es estricto con el lockfile, quizá tengas que
reinstalar. No hay cambios en el código de las alertas.

### El interruptor de animaciones ya funciona en toda la librería

`applyMotion(false)`, `<ThemeProvider animations={false}>` y `--nui-duration`
solo llegaban a una parte de los componentes. **24 transiciones estaban escritas
a mano**, con la duración fija y sin `motion-reduce`, así que ignoraban tanto el
interruptor como `prefers-reduced-motion` del sistema.

Ahora todas pasan por `motion.ts`. Afecta a `Button`, `Input`, `TextArea`,
`Select`, `Table`, `Pagination`, `Calendar`, `DatePicker`, `InfoAlert`,
`ThemeToggle`, y a `Toolbar`, `FloorTabs` y `PropertiesPanel` del editor de
mapas.

- **Nuevo fragmento `motion.control`** para los controles que animan color,
  sombra y escala a la vez — los botones. Hacía falta uno solo porque dos clases
  `transition-*` compiten por la misma propiedad CSS y solo se aplicaría una.
- `Button` acepta la prop `animate`, como el resto de componentes que animan.
- Las duraciones por defecto no cambian donde eran 200 ms; los controles de
  formulario y las filas de tabla pasan a 120 ms, la duración corta de la
  librería. `transition-all` desaparece: ya no se animan cambios de layout.

### `Modal`

- El cierre esperaba **300 ms fijos**, que no coincidían con los 200 ms de
  `--nui-duration` y se esperaban igual con `animate={false}`. Ahora lee la
  duración real y con `animate={false}` cierra al instante.
- Ese temporizador no se cancelaba al desmontar: cerrar y desmontar a la vez
  dejaba un `onClose` en vuelo sobre un componente que ya no existía.
- Acepta `className` para el panel. Era el único componente de `html/` que no la
  tenía.

### Otros

- `Alerta` acepta `showConfirmButton`. Antes se calculaba a partir de `toast` y
  `timer` y **anulaba en silencio** lo que pidiera el llamante. El valor por
  defecto es el de siempre.
- Se exportan los tipos `ButtonProps`, `ModalProps` y `AlertaOptions`, que no
  estaban disponibles para tipar wrappers.
- `genId()` ya no revienta donde no existe `crypto.randomUUID()` — HTTP que no
  sea localhost, Safari anterior a 15.4. Se llevaba por delante el
  `VenueMapEditor` entero.
- `ThemeProvider` memoiza el valor del contexto: dejaba de renderizar a todos
  los consumidores de `useTheme` en cada render.
- Eliminadas las clases `swal-*` de las alertas, que apuntaban a un CSS que esta
  librería nunca ha enviado, y las constantes `DURATION_VAR` /
  `DURATION_FAST_VAR`, que no se usaban ni se exportaban.

## 3.0.2

Arreglo de colores en modo oscuro. Con la paleta por defecto casi no se nota;
si has retematizado la librería, sí.

### Hover que no seguía al tema oscuro

Tres grupos de tokens usaban en `dark:` la variable del tema **claro**. Quien
declarara solo las variables `-dark` veía el color saltar al del tema claro al
pasar el ratón por encima:

- `bgHoverOf.success` / `.warning` — los botones `variant="success"` y
  `variant="warning"`. Además, en claro el color se mezclaba con negro por
  `color-mix`, lo que ignoraba por completo tu color.
- `textHover.accent` / `.danger` — apuntaban en oscuro al **mismo** token que en
  reposo, así que el hover sencillamente no se veía.
- `focusBorder.accent` / `.danger` — no tenían variante `dark:` en absoluto: el
  borde al enfocar usaba el color claro sobre fondo oscuro.

### Cuatro tokens nuevos

La causa de fondo era que faltaban pares de hover, que `danger` sí tenía:

| Token | Claro / Oscuro |
|---|---|
| `success-hover` | green-700 / green-600 |
| `warning-hover` | yellow-700 / yellow-600 |
| `accent-text-hover` | indigo-700 / indigo-300 |
| `danger-text-hover` | red-700 / red-300 |

Son aditivos: si no declaras nada, los colores por defecto no cambian.

### `Skeleton` con más contraste en claro

Los marcadores de carga usaban `surface-muted`, que en claro es gray-50: a 1,5
puntos de luminosidad del blanco del panel, prácticamente invisibles. En oscuro
sí funcionaban (gray-700 sobre gray-800 son 9,5 puntos).

Ahora tienen token propio, `skeleton` (gray-200 / gray-700), que iguala el
contraste en los dos temas y además permite ajustarlo. El modo oscuro no cambia.

Afecta a `Skeleton`, a `SkeletonText` y a las filas de carga de `Table`, que
tenían su propia copia del mismo bloque gris.

**Convención nueva, documentada en el README:** en claro un `*-hover` oscurece el
color de reposo, y en oscuro lo **aclara** — oscurecer sobre fondo oscuro se lee
como «desactivado», no como «encima». Si sobrescribes una variable `*-hover`,
sobrescribe también su `-dark`.

## 3.0.1

Release de empaquetado: no cambia ni una línea de los componentes, pero el
paquete pesa una cuarta parte.

### Empaquetado

- **El paquete pasa de 1,6 MB a 384 kB** (7,1 MB → 1,6 MB desempaquetado).
- Las 9 entradas ahora comparten código en vez de duplicarlo. Antes, mezclar
  `import { Button } from 'neogestify-ui-components'` con
  `import { SaveIcon } from 'neogestify-ui-components/icons'` se llevaba dos
  copias completas de los iconos y del sistema de temas; ahora hay una sola.
- Se dejan de publicar los sourcemaps, que eran la mayor parte del peso.
- `sideEffects: false`, para que los bundlers puedan descartar lo que no uses.
- `prepublishOnly` reconstruye `dist` antes de publicar. Como `dist` está en
  `.gitignore`, hasta ahora un build obsoleto podía salir a npm sin aviso.

### Nueva subruta

- `neogestify-ui-components/element-library-builder`. Ya se compilaba y se
  publicaba, pero no estaba declarada en `exports`, así que solo era alcanzable
  desde la raíz.
- El README documenta ahora **todas** las subrutas disponibles, que hasta ahora
  no aparecían en ningún sitio.

### Interno

- Eliminado `.npmignore`, que contradecía al campo `files` (excluía `src/`, que
  es justo lo que Tailwind necesita escanear).
- Eliminado el campo `exports-tailwind`, que no era estándar y no hacía nada.

## 3.0.0

Four things landed in this release: a calendar, a colour system, a batch of new
components, and animations with an off switch. Plus an accessibility pass over
what already existed.

### Configurable colours

Every colour in the library is now a CSS variable with the previous colour as
its fallback, so **an existing project needs no changes** and a new one can
retint everything by declaring a handful of variables.

```css
:root {
  --nui-accent: #059669;       /* light */
  --nui-accent-dark: #10b981;  /* dark  */
}
```

- 30 semantic tokens: surfaces, borders, text, accent, semantic colours, scrim.
  Full table in the README.
- JavaScript API: `<ThemeProvider colors={{ light, dark }}>`, plus
  `applyNuiColors()`, `nuiColorsToCss()` (for SSR) and `resolveColor()`.
- `VenueMapEditor` gained a `palette` prop for the SVG canvas, which can't use
  Tailwind classes. It merges with the active theme's palette.
- The SweetAlert2 alerts read the variables at call time — background, text and
  button colours all follow.
- New subpath: `neogestify-ui-components/tokens`.
- Fallback values are the exact OKLCH values from Tailwind v4, so nothing
  drifts.

**Shade normalisation.** Around 78 elements in light mode and 69 in dark shifted
by one step. The old code painted the same semantic role with different greys
depending on the file — row hover was `gray-50` in a table, `gray-100` in a
button and `slate-100` in the map editor. They are now one colour. The visible
cases: the secondary button's text (`gray-600` → `gray-500`), the `ThemeToggle`
background (`gray-200` → `gray-50`), table headers (`gray-100` → `gray-50`), the
map editor accent (blue → the library accent) and the focus ring on
`danger`/`success`/`warning` buttons, which now matches the button's own colour.
Any of these can be pinned back with a variable.

### Calendar and DatePicker

A dependency-free calendar built for touch.

- Three modes: single date, multiple dates, and ranges.
- 40 px cells (48 with `size="lg"`), swipe to change month, quick month/year
  grids.
- Measures **its own container**: under 640 px it always renders one month,
  whatever `numberOfMonths` says.
- `DatePicker` opens as a floating panel on desktop and a full-width bottom
  sheet under 640 px of viewport.
- Ranges: continuous pill-shaped band, hover preview, `minRangeDays` /
  `maxRangeDays`, and `rangePresets()` shortcuts.
- Full keyboard support: arrows, Home/End, PageUp/Down, Shift+PageUp for years.
- Date helpers exported (`startOfDay`, `addMonths`, `diffDays`, `toISODate`…),
  all local-time.
- New subpath: `neogestify-ui-components/calendar`.

### New components

| Component | Notes |
|-----------|-------|
| `Card` + `CardHeader` / `CardBody` / `CardFooter` | Header, footer, media, interactive and link modes |
| `Avatar` / `AvatarGroup` | Image → initials → icon fallback; stable tint per name; status dot |
| `Badge` | 8 variants, dot, pill, removable |
| `Alert` | Inline notice, 5 variants, dismissible, actions |
| `Skeleton` / `SkeletonText` | Text, circle, rect; multi-line |
| `Progress` | Determinate and indeterminate |
| `Tabs` | Full `tablist` pattern; line, pill and enclosed variants |
| `Accordion` | Single and multiple; arrow-key navigation; panels stay mounted so they can animate |
| `Breadcrumb` | Collapses the middle, not the ends |
| `Pagination` | Numeric and compact; `pageRange()` exported |
| `Switch` | `role="switch"`; hidden input for forms |
| `Tooltip` | Portal + fixed positioning; press-and-hold on touch |

### Animations

Everything with a spatial transformation now animates, and it can be switched
off globally or per component.

- One CSS variable drives it: `--nui-duration` (200 ms) and
  `--nui-duration-fast` (120 ms).
- Global: `<ThemeProvider animations={false}>`, `applyMotion(false)`, or the
  variables in your own CSS. `motionToCss()` for SSR.
- Per component: the `animate` prop. It writes the same variable inline, so it
  cascades to everything inside.
- `prefers-reduced-motion` is respected regardless, via
  `motion-reduce:transition-none` on every transition.
- `Accordion` animates to its real height with `grid-template-rows: 0fr → 1fr`,
  and gets `inert` while collapsed so the hidden panel stays out of the tab
  order.
- `Tabs` grew a sliding underline that resizes between tabs.
- `Modal`, `DatePicker` (panel and sheet) and `Tooltip` moved from keyframes to
  transitions, which removed the injected `<style>` tags.

### Icons

Nine new: `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `UserIcon`,
`WarningIcon`, `ErrorIcon`, `SlashIcon`, `RingSpinnerIcon`,
`QuarterSpinnerIcon`.

**Every inline SVG now lives in `icons.tsx`.** Components import from the shared
collection instead of defining their own, so swapping an icon changes it
everywhere. The only SVGs left outside are the map editor's canvas and the
dynamic shape previews, which render user-supplied markup.

### Accessibility

Found and fixed during a review pass over the existing code:

- **Invisible keyboard focus.** The map editor drew no focus indicator at all,
  and the floor-rename input had `outline-none` with no replacement. Added a
  shared `focus-visible` ring across `Toolbar`, `PropertiesPanel`, `FloorTabs`
  and `ElementLibraryBuilder`.
- **Floor tabs were unreachable by keyboard** — plain `<div onClick>` with no
  `tabIndex`. They are now a proper `tablist` with `aria-selected`, roving
  tabindex, arrow/Home/End navigation and F2 to rename.
- **Modal had no focus trap.** `<dialog open>` is not modal: the background was
  still tabbable. Added `aria-modal`, `aria-labelledby`, initial focus, Tab
  containment and focus restore on close. The close button had no `aria-label`.
- **Contrast below AA.** Calendar outside-month days were `gray-400` on white
  (2.8:1) → `gray-500` (4.8:1); same for weekday headers and several editor
  greys.
- **Dark-mode gaps** in `ElementLibraryBuilder`: four spots stayed light grey on
  a dark background.
- **Missing `type="button"`** on 8 buttons that would have submitted a
  surrounding form.
- **Nested interactive element**: the `DatePicker` clear control was a
  `<span role="button">` inside the trigger button — invalid HTML that screen
  readers ignore. It is now a sibling.
- **Reduced motion**: `hover:scale-105` and the table skeleton's pulse are now
  `motion-safe:`. Loading spinners stay animated on purpose — a frozen spinner
  communicates nothing.

### Fixes

- **Modal header and footer were lighter than the panel in dark mode.** A
  regression from the token migration: they used to be `dark:bg-gray-800`
  (matching the panel) and got mapped to `surface-muted`, whose dark value is
  gray-700. A band lighter than its panel reads as raised, and a header is
  recessed, not raised. New `surface-band` token — gray-50 in light (the
  original value, so nothing changes there) and gray-900 in dark. Applied to the
  modal's header and footer and to the card footer, which had the same problem.

### Responsive fixes

- **`Tabs` could break the page layout.** Its bar doesn't wrap, so its intrinsic
  minimum width is that of every tab together. As a grid or flex item that
  forced the whole track wider than the viewport instead of letting the bar
  scroll — measured at 403 px inside a 371 px column. Fixed with `min-w-0` on
  the root: in a 300 px grid it now stays at 300 px and scrolls.
- **`Pagination` overflowed on narrow screens** with many pages. It wraps now.
  `compact` is still the better choice on mobile.
- **`Accordion`** long `meta` text is capped at 40 % and truncates instead of
  squeezing the title.
- **Showcase**: page padding, section padding and headings now scale with the
  breakpoint instead of using desktop values everywhere; the icon grid goes
  3 → 4 → 6 columns; the header wraps; and grid columns carry `min-w-0` so
  non-wrapping content can't inflate a track.

### Documentation

- **Framework guides**: Vite, Next.js (App Router and Pages Router), Astro,
  Remix/React Router, plus a table for CRA, Gatsby, pnpm monorepos, Tailwind 3.x
  and CDN. Two recurring gotchas are spelled out: the `@source` path is relative
  to the CSS file, and the package carries no `"use client"` banner, so the App
  Router needs a client component.
- New README sections for theming, animations, the calendar and all the new components.

### Notes

- No breaking API changes. The major bump reflects the shade normalisation and
  the new subpaths.
- The library still ships no CSS: components use Tailwind classes and your
  project compiles them.
