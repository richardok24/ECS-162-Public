window.onresize = function(event) {
    var windowQuery = window.matchMedia("(min-width: 549px)");
    if (windowQuery.matches) {
        document.getElementById('MainPage-Image').style.display = 'inline';
    }

    var readMoreButton = document.getElementById('ReadMore-Button');

    if (!windowQuery.matches && readMoreButton.style.display == 'none') {
        document.getElementById('MainPage-Image').style.display = 'inline';
    }
    else if (!windowQuery.matches && readMoreButton.style.display != 'none') {
        document.getElementById('MainPage-Image').style.display = 'none';
    }
};

function readMore() {
    document.getElementById('MainPage-Expansion').style.display = 'inline';
    document.getElementById('ReadMore-Button').style.display = 'none';
    document.getElementById('ReadLess-Button').style.display = 'inline';
    document.getElementsByTagName('footer')[0].style.display = 'flex';
    var windowQuery = window.matchMedia("(max-width: 549px)");
    if (windowQuery.matches) {
        document.getElementById('MainPage-Image').style.display = 'inline';
    }
}

function readLess() {
    document.getElementById('MainPage-Expansion').style.display = 'none';
    document.getElementById('ReadLess-Button').style.display = 'none';
    document.getElementById('ReadMore-Button').style.display = 'inline';
    document.getElementsByTagName('footer')[0].style.display = 'none';
    var windowQuery = window.matchMedia("(max-width: 549px)");
    if (windowQuery.matches) {
        document.getElementById('MainPage-Image').style.display = 'none';
    }
}