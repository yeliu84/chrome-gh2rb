window.onload = function() {
    var projList = document.querySelector('#proj-list');
    var projItemTpl = projList.removeChild(projList.firstElementChild);
    var noProjMsg = document.querySelector('#no-proj-msg');
    var projNameField = document.querySelector('#proj-name-field');
    var projIdField = document.querySelector('#proj-id-field');
    var addButton = document.querySelector('#add-button');
    var notification = document.querySelector('#notification');

    function getListItemId(projName, projId) {
        return 'proj-item-' + projName + '-' + projId;
    }

    function onRemoveClickFactory(name, id) {
        return function(event) {
            event.stopPropagation();
            event.preventDefault();

            gh2rb.removeProject(name, id, function(err) {
                if (!err) {
                    updateList();
                }
            });
        };
    }

    function createListItem(name, id) {
        var elem = projItemTpl.cloneNode(true);

        elem.id = getListItemId(name, id);
        elem.onRemoveClick = onRemoveClickFactory(name, id);

        elem.children[0].innerHTML = name;
        elem.children[1].innerHTML = id;
        elem.children[2].addEventListener('click', elem.onRemoveClick);

        return elem;
    }

    function updateListItem(elem, name, id) {
        var changed = false;

        if (elem.children[0].innerHTML !== name) {
            elem.children[0].innerHTML = name;
            changed = true;
        }
        if (elem.children[1].innerHTML !== id) {
            elem.children[1].innerHTML = id;
            changed = true;
        }
        if (changed) {
            elem.id = getListItemId(name, id);
            elem.children[2].removeEventListener('click', elem.onRemoveClick);

            elem.onRemoveClick = onRemoveClickFactory(name, id);
            elem.children[2].addEventListener('click', elem.onRemoveClick);
        }
    }

    function updateList() {
        gh2rb.loadProjects(function(err, projects) {
            var i;
            var len;
            var name;
            var id;
            var liLen = projList.children.length;

            if (err) {
                return;
            }

            for (i = 0, len = projects.length; i < len; i++) {
                name = projects[i].name;
                id = projects[i].id;

                if (i < liLen) {
                    updateListItem(projList.children[i], name, id);
                } else {
                    projList.appendChild(createListItem(name, id));
                }
            }

            liLen = projList.children.length;
            if (liLen > len) {
                for (i = len; i < liLen; i++) {
                    projList.removeChild(projList.children[i]);
                }
            }

            if (len > 0) {
                noProjMsg.classList.add('hidden');
            } else {
                noProjMsg.classList.remove('hidden');
            }
        });
    }

    function checkInputError() {
        var name = projNameField.value;
        var id = projIdField.value;

        if (!name || !id) {
            return 'name and id are required';
        }

        return false;
    }

    function notify(msg) {
        notification.innerHTML = msg;
    }

    function onKeyup() {
        var err = checkInputError();

        if (err) {
            addButton.disabled = true;
        } else {
            addButton.disabled = false;
        }
    }

    function onAddButtonClick(event) {
        event.stopPropagation();
        event.preventDefault();

        var name = projNameField.value;
        var id = projIdField.value;

        gh2rb.addProject(name, id, function(err) {
            if (err) {
                notify(err);
            } else {
                updateList();

                projNameField.value = '';
                projIdField.value = '';
                addButton.disabled = true;
            }
        });
    }

    projNameField.addEventListener('keyup', onKeyup);
    projIdField.addEventListener('keyup', onKeyup);
    addButton.addEventListener('click', onAddButtonClick);

    updateList();
};
