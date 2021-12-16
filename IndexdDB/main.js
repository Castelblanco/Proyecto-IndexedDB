"use strict";
const classHtml = clase =>document.querySelector(clase);

let inputNombre = classHtml(".nombre"),
    inputApellido = classHtml(".apellido"),
    inputEdad = classHtml(".edad"),
    botonR = classHtml(".boton"),
    resFormulario = classHtml(".res_formulario"),
    res = classHtml(".res");

botonR.addEventListener("click", e=>{
    let verificacion = examinarFormulario();
    if (verificacion[0]){
        resFormulario.classList.add("red");
        resFormulario.innerHTML = verificacion[1];
    }else{
        resFormulario.classList.add("green");
        resFormulario.innerHTML = verificacion[1];
        crearObjeto({nombre: inputNombre.value, apellido: inputApellido.value, edad: inputEdad.value});
    }
})



const examinarFormulario = ()=>{
    let err,
        res;
    if (inputNombre.value.length < 4 || inputApellido.value.length < 4 || inputEdad.value.length < 1){
        err = true;
        res = "Complete el Formulario";
        return [err, res];
    }else{
        err = false;
        res = "Registro Completado";
        return [err, res];
    }
}

const idbRequest = indexedDB.open("datos", 1);

idbRequest.addEventListener("upgradeneeded", e=>{
    const db = idbRequest.result;
    db.createObjectStore("precio", {
        autoIncrement: true
    })
})

idbRequest.addEventListener("success", e=>{
    console.log("todo salio bien");
    leerObjeto();
})

idbRequest.addEventListener("error", e=>{
    console.log("ocurrio un error");
})

const crearObjeto = objeto =>{
    const db = obtenerData("readwrite", "Objeto creado");
    db.add(objeto);
}

const leerObjeto = ()=>{
    const db = obtenerData("readonly"),
          cursor = db.openCursor();
    let fragmento = document.createDocumentFragment();
    cursor.addEventListener("success", e=>{
        if (cursor.result){
            let datos = contenidoHtml(cursor.result.key, cursor.result.value);
            fragmento.appendChild(datos);
            cursor.result.continue();
        }else res.appendChild(fragmento);
        
    })
}

const editarObjeto = (key, objeto)=>{
    const db = obtenerData("readwrite");
    db.put(objeto, key);
}

const borrarObjeto = key=>{
    const db = obtenerData("readwrite");
    db.delete(key);
}

const obtenerData = (modo, msg)=>{
    const db = idbRequest.result,
          idbTransation = db.transaction("precio", modo),
          objetoS = idbTransation.objectStore("precio");
    idbTransation.addEventListener("complete", e=>{
        console.log(msg);
    })
    return objetoS;
}

const contenidoHtml = (key, datos)=>{
    const crearHtml = etiqueta=>document.createElement(etiqueta);

    const contenido = crearHtml("div"),
          nombres =   crearHtml("h3"),
          apellidos = crearHtml("h3"),
          edades =    crearHtml("h3"),
          opciones =  crearHtml("div"),
          textos =    crearHtml("div"),
          textosIn1 = crearHtml("div"),
          textosIn2 = crearHtml("div"),
          textosIn3 = crearHtml("div"),
          botonG =    crearHtml("button"),
          botonR =    crearHtml("button");
    
    contenido.classList.add("res2");
    textos.classList.add("textos");
    textosIn1.classList.add("textosIn");
    textosIn2.classList.add("textosIn");
    textosIn3.classList.add("textosIn");
    nombres.classList.add("titulos");
    apellidos.classList.add("titulos");
    edades.classList.add("titulos");
    botonG.classList.add("no_acceso");
    botonR.classList.add("boton_borrar");

    const atributo = html =>{
        html.setAttribute("contenteditable", "true");
        html.setAttribute("spellcheck", "false");
        html.addEventListener("keyup", e=>{
            botonG.classList.replace("no_acceso", "acceso");
        })
    }

    atributo(nombres);
    atributo(apellidos);
    atributo(edades);

    botonR.textContent = "Borrar";
    botonG.textContent = "Guardar";
    nombres.textContent = datos.nombre;
    apellidos.textContent = datos.apellido;
    edades.textContent = datos.edad;

    textosIn1.appendChild(nombres);
    textosIn2.appendChild(apellidos);
    textosIn3.appendChild(edades);

    textos.appendChild(textosIn1);
    textos.appendChild(textosIn2);
    textos.appendChild(textosIn3);
    opciones.appendChild(botonG);
    opciones.appendChild(botonR);

    contenido.appendChild(textos);
    contenido.appendChild(opciones);

    botonG.addEventListener("click", e=>{
        editarObjeto(key, {nombre: nombres.textContent, apellido: apellidos.textContent, edad: edades.textContent});
        botonG.classList.replace("acceso", "no_acceso");
    })

    botonR.addEventListener("click", e=>{
        borrarObjeto(key);
        res.removeChild(contenido);
    })

    return contenido;
}


