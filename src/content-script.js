function processPage(projectMap) {
    var path = window.location.pathname;
    var parts = path.split('/');
    var project = parts[2];
    var isProjectDefined = project in projectMap;

    function isNewsPage() {
        if (/.+dashboard$/.test(path)) {
            return true;
        } else if (path === '/' && document.getElementById('dashboard')) {
            return true;
        }
        return false;
    }

    function isCommitPage() {
        if (isProjectDefined && parts[3] === 'commit') {
            return true;
        }
        return false;
    }

    function buildTaskUrl(projectId, taskId) {
        return 'https://redbooth.com/a/#!/projects/' + projectId + '/tasks/' + taskId;
    }

    function buildTaskAnchor(projectId, taskId) {
        return '<a href="' + buildTaskUrl(projectId, taskId) + '" target="_blank">' + taskId + '</a>';
    }

    function convertCommitMessage(msg, projectId) {
        return msg.replace(/\[(\d+)\]/g, function(m, taskId) {
            return '[' + buildTaskAnchor(projectId, taskId) + ']';
        });
    }

    function convertPlainText(commitMsgElems, projectId) {
        for (var i = 0, len = commitMsgElems.length; i < len; i++) {
            commitMsgElems[i].innerHTML = convertCommitMessage(commitMsgElems[i].innerHTML, projectId);
        }
    }

    function convertAnchor(commitMsgElems, projectId) {
        var anchor;
        var parentNode;
        var msg;
        var removed;
        var clone;
        var span;
        var pat = /([^\[\]]*)\[(\d+)\]([^\[\]]*)/g;
        var match;
        var before;
        var taskId;
        var after;

        for (var i = 0, len = commitMsgElems.length; i < len; i++) {
            anchor = commitMsgElems[i];
            parentNode = anchor.parentNode;
            msg = anchor.innerHTML;
            console.log(msg);
            removed = false;

            match = pat.exec(msg);
            while (match) {
                before = match[1];
                taskId = match[2];
                after = match[3];

                if (!removed) {
                    parentNode.removeChild(anchor);
                    removed = true;
                }

                if (before) {
                    clone = anchor.cloneNode();
                    clone.innerHTML = before;
                    parentNode.appendChild(clone);
                }

                span = document.createElement('span');
                span.innerHTML = '[' + buildTaskAnchor(projectId, taskId) + ']';
                parentNode.appendChild(span);

                if (after) {
                    clone = anchor.cloneNode();
                    clone.innerHTML = after;
                    parentNode.appendChild(clone);
                }

                match = pat.exec(msg);
            }
        }
    }

    function processNewsPage() {
        var newsDiv = document.querySelector('#dashboard .news');
        var alertDivs = newsDiv.querySelectorAll('.alert');
        var alertDiv;
        var titleDiv;
        var projName;
        var projId;

        for (var i = 0, aLen = alertDivs.length; i < aLen; i++) {
            alertDiv = alertDivs[i];
            titleDiv = alertDiv.querySelector('.title');
            projName = titleDiv.lastElementChild.innerHTML.split('/')[1];
            projId = projectMap[projName];
            if (projId) {
                convertPlainText(alertDiv.querySelectorAll('.details .commits .message blockquote'), projId);
            }
        }
    }

    function processCommitTitlePage() {
        convertPlainText(document.querySelectorAll('p.commit-title'), projectMap[project]);
    }

    function processCommitAnchorPage() {
        convertAnchor(document.querySelectorAll('a.message'), projectMap[project]);
    }

    if (isProjectDefined) {
        switch (parts[3]) {
        case 'commits':
            processCommitAnchorPage();
            break;
        case 'tree':
            processCommitAnchorPage();
            break;
        case 'blob':
            processCommitAnchorPage();
            break;
        case 'commit':
            processCommitTitlePage();
            break;
        default:
            processCommitAnchorPage();
            break;
        }
    } else if (isNewsPage()) {
        processNewsPage();
    }

    function checkLocation() {
        if (path !== window.location.pathname) {
            processPage(projectMap);
        } else {
            setTimeout(checkLocation, 1000);
        }
    }

    checkLocation();
}

chrome.runtime.sendMessage({fn: 'loadProjects'}, function(response) {
    var err = response.error;
    var projects = response.results[0];

    if (err || !projects || projects.length < 1) {
        return;
    }

    var projectMap = {};

    for (var i = 0, len = projects.length; i < len; i++) {
        projectMap[projects[i].name] = projects[i].id;
    }

    processPage(projectMap);
});
