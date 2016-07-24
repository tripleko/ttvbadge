let chanData;
let globalData;
let chatList = document.getElementsByClassName("chat-line");

//Add badges to the given badgeCollect node.
function addBadges(badgeCollect, badgeNum, badgeTitle, imgurID) {
    //since the badges are child of childs, just search innerHTML for original-title="Broadcaster"
    //or similar. Basically use the same method that I did for my original greasemonkey script at this point.
    //I've narrowed it down to badges so that the message doesn't screw up my detection.

    let badgeCSS = "customTTVBadge" + badgeNum;

    if(badgeCollect.innerHTML.indexOf(badgeCSS) === -1) {
        let tempBadge = document.createElement("a");
        tempBadge.setAttribute("target", "_blank");
        tempBadge.setAttribute("rel", "noopener");
        
        tempBadge.innerHTML = "<img class=\"badge-img tooltip custom-badge-img " + badgeCSS + "\" src=\"https://i.imgur.com/" + imgurID + "\" title=\"" + badgeTitle + "\">";
        
        badgeCollect.appendChild(tempBadge);
    }
}

function updateAllChat() {
    for(let b = 0; b < chatList.length; b++) {
        let user;
        let badgeCollect;
        for(let i = 0; i < chatList[b].children.length; i++) {
            if(chatList[b].children[i].className.indexOf("from") !== -1) {
                user = chatList[b].children[i].innerHTML;
            }
            else if(chatList[b].children[i].className.indexOf("badges") !== -1) {
                badgeCollect = chatList[b].children[i];
            }
        }

        //Start off checking global data
        if(globalData !== null) {
            for(let i = 0; i < globalData.badgeImageLists.length; i++) {
                if(globalData.badgeImageLists[i][0] !== "") {
                    if(globalData.badgeUserLists[i].indexOf(user) > -1) {
                        addBadges(badgeCollect, "global" + i, globalData.badgeTitles[i][0], globalData.badgeImageLists[i][0]);
                    }
                }
            }
        }

        //Check channel specific data
        if(chanData !== null) {
            for(let i = 0; i < chanData.badgeImageLists.length; i++) {
                if(chanData.badgeImageLists[i][0] !== "") {
                    if(chanData.badgeUserLists[i].indexOf(user) > -1) {
                        addBadges(badgeCollect, i, chanData.badgeTitles[i][0], chanData.badgeImageLists[i][0]);
                    }
                }
            }
        }
    }
}

function updateGlobalData() {
    $.getJSON("https://badge.tripleko.com/global/global.json", function(data) {
        globalData = data;
    });
}

/*Frequently the chat loads late so it's necessary to check that observer has been properly assigned.
Also, there's a possibility that the user navigates away and opens up a new channel with a new chat, in which case the observer will cease to work.

setInterval was the only reliable method I could come up with to deal with these cases.
*/
let observerHasVal = false;
//Run starts here.
let refreshID = setInterval(initObserver, 1000);
let chatLinesNode;
let roomTitleNode;
let tempNode;
let observer;

let roomTitle;
let tempRoomTitle;

function updateChanData() {
    tempRoomTitle = $(".room-title").first().text();
    if(tempRoomTitle != null && tempRoomTitle != "") {
        if(tempRoomTitle !== roomTitle) {
            roomTitle = tempRoomTitle;
        }

        $.getJSON( "https://badge.tripleko.com/users/" + roomTitle, function(data) {
            chanData = data;
        });
    }
}

function initObserver() {
    tempNode = document.getElementsByClassName("chat-lines")[0];

    //If this condition is true, that means that the user has gone to a new page or channel.
    if(tempNode !== chatLinesNode) {
        chanData = null;
        updateChanData();

        chatLinesNode = tempNode;
        
        if(observer !== null && observer !== undefined) {
            observer.disconnect();
        }
        
        observerHasVal = true;
        
        observer = new MutationObserver(function(mutations) {
            updateAllChat();
            //alert(mutations[0].target.lastChild + " " + mutations[0].target.nodeName);
        });

        let config = { attributes: false, childList: true, characterData: false };

        observer.observe(chatLinesNode, config);
    }
}

//One time inits
updateChanData();
updateGlobalData();

//TODO: Replace with more elegant solution?
//I send out a check every second after document idle because the chat takes a while to load.
//I reduce to every 5 seconds after the initial load to avoid mitigate the load on my site.
setTimeout(function() {
    updateChanData();
    updateAllChat();
}, 1000);
setTimeout(function() {
    updateChanData();
    updateAllChat();
}, 2000);
setTimeout(function() {
    updateChanData();
    updateAllChat();
}, 3000);
setTimeout(function() {
    updateChanData();
    updateAllChat();
}, 4000);

//Periodically
setInterval(updateChanData, 5000);
