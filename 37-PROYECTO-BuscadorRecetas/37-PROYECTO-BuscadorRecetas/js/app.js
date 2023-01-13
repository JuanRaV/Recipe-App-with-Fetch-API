function iniarApp(){

    const resultado = document.querySelector('#resultado')
    const selectCategorias = document.querySelector('#categorias');
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias()
    }
    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv){
        obtenerFavoritos();
    }
        
    const modal = new bootstrap.Modal('#modal', {})

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        fetch(url)
            .then(respuesta =>respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories));
    }

    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria=>{
            const {strCategory} = categoria
            const option = document.createElement('OPTION');
            option.value = strCategory
            option.textContent = strCategory
            selectCategorias.appendChild(option)
        })
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

        fetch(url)
            .then(respuesta=>respuesta.json())
            .then(resultado =>mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []){
        limpiarHTML(resultado);
        //Crear un heading
        const heading = document.createElement('H2');
        heading.classList.add('text-center','text-black','my-5')
        heading.textContent = recetas.length?'Resultados' : 'No hay resultados'

        resultado.appendChild(heading)
        //Iterar en los resultados
        recetas.forEach(receta=>{
            const {idMeal,strMeal,strMealThumb} = receta

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card','mb-4')

            const recetaImg = document.createElement('IMG');
            recetaImg.classList.add('card-img-top')
            recetaImg.alt = `Imagen de la receta ${strMeal??receta.titulo}`;
            recetaImg.src = strMealThumb??receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-tittle','mb-3')
            recetaHeading.textContent = strMeal??receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn','btn-danger','w-100');
            recetaButton.textContent = 'Ver receta'
            // recetaButton.dataset.bsTarget = '#modal'
            // recetaButton.dataset.bsToggle = 'modal'
            recetaButton.onclick = function(){
                seleccionarReceta(idMeal??receta.id)
            }

            //Inyectar en el codigo HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImg);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor)
        })
    }

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta=>respuesta.json())
            .then(resultado=>mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta){
        const {idMeal,strInstructions,strMeal,strMealThumb } = receta
        //Anadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal; //Nombre de la receta
        modalBody.innerHTML = `
            <img class = "img=fluid" src = "${strMealThumb}" alt = "receta ${strMealThumb}"/>

            <h3 class = "my-3"> Instrucciones</h3>
            <p>${strInstructions}</p>

            <h3 class = "my-3"> Ingredientes y Cantidades </h3>
        ` ;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        //Mostrar cantidades e ingredientes
        for(let i = 1; i<=20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item')
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
                listGroup.appendChild(ingredienteLi)
            }
        }
        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer')
        limpiarHTML(modalFooter)
        //Botones de cerrar y favorito
        const btnFav = document.createElement('BUTTON');
        btnFav.classList.add('btn','btn-danger','col');
        btnFav.textContent = existeStorage(idMeal)? 'Eliminar Favorito':'Guardar Favorito';

        //LocalStorage
        btnFav.onclick = function(){

            if(existeStorage(idMeal)){
                eliminarFav(idMeal);
                btnFav.textContent = 'Guardar Favorito'
                mostrarToast('Eliminado correctamente')
                return
            }
            
            agregarFav({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb    
            });
            
            btnFav.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado correctamente');
        }

        const btnCerrar = document.createElement('BUTTON');
        btnCerrar.classList.add('btn','btn-secondary','col')
        btnCerrar.textContent = 'Cerrar'
        btnCerrar.onclick = function(){
            modal.hide();
        }

        modalFooter.appendChild(btnFav)
        modalFooter.appendChild(btnCerrar)

        //Muestra el modal
        modal.show();

        
    }
    function agregarFav(receta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos'))??[];

        localStorage.setItem('favoritos',JSON.stringify([...favoritos,receta]));
    }

    function eliminarFav(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos'))??[];
        const nuevosFav = favoritos.filter(favorito=>favorito.id!==id);
        localStorage.setItem('favoritos',JSON.stringify(nuevosFav))
    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos'))??[];
        return favoritos.some(favorito=>favorito.id===id);
    }
    function mostrarToast(msj){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = msj;

        toast.show();
    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){
            mostrarRecetas(favoritos)
            return;
        }

        const noFav = document.createElement('p');
        noFav.textContent = 'No hay favoritos';
        noFav.classList.add('fs-4','text-center','font-bold','mt-5');

        resultado.appendChild(noFav);

    }

    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild)
        }
    }
}

document.addEventListener('DOMContentLoaded',iniarApp);