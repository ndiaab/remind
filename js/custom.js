(() => {
    const HREF = window.location.href;
    let navBarItems, menuItemsTab;
    let form;
    const validEmail = (email) => {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }

    const validateHuman = (honeypot) => {
        if (honeypot) {  //if hidden form filled up
            return true;
        }
    }

    const blankItems = (form) => {
        const elements = form.elements;
        for (var i = 0; i < elements.length; i++) {
            if (!!elements[i].name) {
                elements[i].value = '';
            }
        }
    }

    // get all data in form and return object
    const getFormData = (form) => {
        var elements = form.elements;

        var fields = Object.keys(elements).filter((k) => {
            return (elements[k].name !== 'honeypot');
        }).map((k) => {
            if (elements[k].name !== undefined) {
                return elements[k].name;
                // special case for Edge's html collection
            } else if (elements[k].length > 0) {
                return elements[k].item(0).name;
            }
        }).filter((item, pos, self) => {
            return self.indexOf(item) == pos && item;
        });

        var formData = {};
        fields.forEach((name) => {
            var element = elements[name];

            // singular form elements just have one value
            formData[name] = element.value;

            // when our element has multiple items, get their values
            if (element.length) {
                var data = [];
                for (var i = 0; i < element.length; i++) {
                    var item = element.item(i);
                    if (item.checked || item.selected) {
                        data.push(item.value);
                    }
                }
                formData[name] = data.join(', ');
            }
        });

        // add form-specific values into the data
        formData.formDataNameOrder = JSON.stringify(fields);
        formData.formGoogleSheetName = form.dataset.sheet || 'responses'; // default sheet name
        formData.formGoogleSendEmail = form.dataset.email || ''; // no email by default

        return formData;
    }

    const handleFormSubmit = () => {  // handles form submit without any jquery
        event.preventDefault();           // we are submitting via xhr below
        var data = getFormData(form);         // get the values submitted in the form
        var invalidEmail = form.querySelector('.email-invalid');
        var successMessage = form.querySelector('.submit-msg');

        invalidEmail.classList.add('d-none');
        successMessage.classList.add('d-none');
        successMessage.classList.remove('text-danger');
        successMessage.classList.remove('text-success');

        if (validateHuman(data.honeypot)) {  //if form is filled, form will not be submitted
            return false;
        }

        if (data.email && !validEmail(data.email)) {   // if email is not valid show error
            if (invalidEmail) {
                invalidEmail.classList.remove('d-none');
                return false;
            }
        } else {
            successMessage.classList.add('d-none');
            disableButton(form.querySelector('.submit-btn'), true);
            var url = form.action;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            // xhr.withCredentials = true;
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                disableButton(form.querySelector('.submit-btn'), false);
                if (xhr.status === 200) {
                    successMessage.innerHTML = 'Thank you for contacting us, we will get back to you soon';
                    successMessage.classList.add('text-success');
                    successMessage.classList.remove('d-none');
                    blankItems(form);
                }
                else {
                    successMessage.innerHTML = 'Sorry, a technical error occurred! Please try again later';
                    successMessage.classList.add('text-danger');
                    successMessage.classList.remove('d-none');
                }
                return;
            };
            // url encode form data for sending as post data
            var encoded = Object.keys(data).map((k) => {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
            }).join('&');
            xhr.send(encoded);
        }
    }

    const disableButton = (element, isDisabled) => {
        element.disabled = isDisabled;
    }
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
    };

    const displayAssessments = (assessments) => {
        let assessmentsHTML = '<div class="card-columns">';
        assessments.forEach(assessment => {
            assessmentsHTML += '<div class="card p-2">';
            assessmentsHTML += !!assessment.title ?
                '<div class="card-body">' +
                '<h4 class="">' + assessment.title + '</h4>' +
                '</div>' : '';
            assessmentsHTML += !!assessment.image ? '<img class="card-img-top" src="./images/assessment/' + assessment.image + '" alt="">' : '';
            assessmentsHTML += !!assessment.subtitle ? '<div class="card-body">' + assessment.subtitle + '</div>' : '';
            assessmentsHTML += '</div>';
        });
        assessmentsHTML += '</div>';
        document.querySelector('div.assessment').innerHTML = assessmentsHTML;
    }

    const displayPublications = (publications) => {
        let publicationsHTML = '<h2>Publications : </h2>';
        publications.reverse();
        publications.forEach(publication => {
            publicationsHTML += '<p><b>' + publication.title + ': </b>' +
                '<br/><a href="' + HREF + 'pdf/' + publication.pdf + '" target="_blank">' + publication.description + '&nbsp;<img class="icon" src="./images/pdf.svg" alt></a></p>'
        });
        document.querySelector('div.publication').innerHTML = publicationsHTML;
    }

    const displayOrganisation = (organisation) => {
        const board = organisation.board,
            scientificCommitee = organisation.scientificCommitee;
        let organisationHTML = '<ul class="list-group list-group-flush">' +
            '<li class="list-group-item"><h4 class="pt-2 m-2">Board</h4></li>';

        !!board && board.forEach(element => {
            organisationHTML += '<li class="list-group-item"><b>' + element.poste + '</b> : ' + element.name + '</li>'
        });
        organisationHTML += '</ul>';

        document.querySelectorAll('div.board').forEach (domElement => {
            domElement.innerHTML = organisationHTML;
        });

        organisationHTML = '<ul class="list-group list-group-flush">' +
        '<li class="list-group-item"><h4 class="pt-2 m-2">Scientific Commitee</h4></li>';
        !!scientificCommitee && scientificCommitee.forEach(element => {
            organisationHTML += '<li class="list-group-item">' + element + '</li>'
        });
        organisationHTML += '</ul>';
        document.querySelector('div.scientific').innerHTML += organisationHTML;
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

        form = document.querySelector('form.gform');
        form.addEventListener('submit', handleFormSubmit, false);

        loadJSON(HREF + '/json/organisation.json', (response) => {
            // Parse JSON string into object
            displayOrganisation(JSON.parse(response));
        });

        loadJSON(HREF + '/json/publications.json', (response) => {
            // Parse JSON string into object
            displayPublications(JSON.parse(response));
        });

        loadJSON(HREF + '/json/assessment.json', (response) => {
            // Parse JSON string into object
            displayAssessments(JSON.parse(response));
        });
    };

    document.addEventListener('DOMContentLoaded', loaded, false);
})();