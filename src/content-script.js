function processPage(projects) {
    var path = window.location.pathname;
    console.log('path = ' + path);
    var projectMap = {};

    for (var i = 0, len = projects.length; i < len; i++) {
        projectMap[projects[i].name] = projects[i].id;
    }

    function isNewsPage() {
        if (/.+dashboard$/.test(path)) {
            return true;
        } else if (path === '/' && document.getElementById('dashboard')) {
            return true;
        }
        return false;
    }

    function isProjectPage() {
        var projName = path.split('/')[2];
        return projName in projectMap;
    }

    function isCommitsPage() {
    }

    function isCommitPage() {
    }

    function convertCommitMessage(msg) {
        return msg;
    }

    function processNewsPage() {
        var newsDiv = document.querySelector('#dashboard .news');
        var alertDivs = newsDiv.querySelectorAll('.alert');
        var alertDiv;
        var titleDiv;
        var projName;
        var projId;
        var commitMsgElems;

        for (var i = 0, aLen = alertDivs.length; i < aLen; i++) {
            alertDiv = alertDivs[i];
            titleDiv = alertDiv.querySelector('.title');
            projName = titleDiv.lastElementChild.innerHTML.split('/')[1];
            projId = projectMap[projName];
            if (projId) {
                commitMsgElems = alertDiv.querySelectorAll('.details .commits .message blockquote');
                for (var j = 0, cLen = commitMsgElems.length; j < cLen; j++) {
                    commitMsgElems.innerHTML = convertCommitMessage(commitMsgElems.innerHTML);
                }
            }
        }
    }

    function processProjectPage() {
        var commitMsgElems = document.querySelectorAll('a.message');

        for (var i = 0, len = commitMsgElems.length; i < len; i++) {
            commitMsgElems[i].innerHTML = convertCommitMessage(commitMsgElems[i].innerHTML);
        }
    }

    function processCommitsPage() {
    }

    function processCommitPage() {
    }

    if (isNewsPage()) {
        processNewsPage();
    } else if (isProjectPage()) {
        processProjectPage();
    } else if (isCommitsPage()) {
        processCommitsPage();
    } else if (isCommitPage()) {
        processCommitPage();
    }
}

chrome.runtime.sendMessage({fn: 'loadProjects'}, function(response) {
    var err = response.error;
    var projects = response.results[0];

    if (err || !projects || projects.length < 1) {
        return;
    }

    processPage(projects);
});

