(() => {
    const HREF = window.location.href;
    let navBarItems, menuItemsTab;
    const removeActiveClass = () => {
        for (let i = 0; i < navBarItems.length; ++i) {
            navBarItems[i].classList.remove('active');
        }
    };

    const selectTab = (evt) => {
        let itemsClass = evt.target.classList.value;
        for (let i = 0; i < navBarItems.length; ++i) {
            if (itemsClass.indexOf(menuItemsTab[i]) !== -1) {
                document.querySelector('input.' + menuItemsTab[i]).checked = true;
                removeActiveClass();
                evt.target.classList.add('active');
                if (document.querySelector('.navbar-toggler').attributes.getNamedItem('aria-expanded').value === 'true') {
                    document.querySelector('.navbar-toggler').click();
                }
                break;
            }
        }
    }
    const addListener = () => {
        document.querySelector('.navbar-nav').addEventListener('click', selectTab)
    }

    const generateMenuItemsTab = () => {
        const menu = 'menu';
        let menutab = [];
        for (let i = 1; i <= navBarItems.length; ++i) {
            menutab.push(menu + i);
        }
        return menutab;
    }

    const displayPublications = (publications) => {
        let publicationsHTML = '<h2>Publications : </h2>';
        publications.forEach(publication => {
            publicationsHTML += '<p><b>' + publication.title + ': </b><br/>' + publication.description + ' <a href="'+ HREF +'pdf/'+ publication.pdf +'" target="_blank"><img style="height: 25px;" src="./images/pdf.svg" alt></a></p>'
        });
        document.querySelector('div.menu3').innerHTML = publicationsHTML;
    }

    function loadJSON(link, callback) {

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', link, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    const loaded = () => {
        addListener();
        navBarItems = document.querySelectorAll('.nav-item');
        menuItemsTab = generateMenuItemsTab();
        //displayPublications(laodPublications());
        loadJSON(HREF + 'json/publications.json',(response) => {
            // Parse JSON string into object
            displayPublications(JSON.parse(response));
        });
    };

    document.addEventListener('DOMContentLoaded', loaded, false);
})();