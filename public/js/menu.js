/*jshint esversion: 6 */

function openMenu(e) {
    $(".menuSelected").removeClass("menuSelected");
    let $ele = $(document.elementFromPoint(e.pageX, e.pageY));
    let $menu = $("menu");
    let left = e.pageX;
    let width = $(document).width();
    let height = $(document).height();
    let menuWidth = $menu.outerWidth();
    let menuHeight = $menu.outerHeight();
    if ((width - left) < menuWidth) {
      left = width - menuWidth;
    }
    

    let $block = $ele.closest(".block");
    $menu.removeAttr('class');

    if ($ele.hasClass("settingProp")) {
        let top = $ele.offset().top + $ele.outerHeight() + 10;
        if ((top + menuHeight - height) > 0) {
            top = $ele.offset().top - menuHeight - 10;
            $menu.addClass("above");
            $menu.removeClass("bellow");
        } else {
            $menu.addClass("bellow");
            $menu.removeClass("above");
        }
        left -= (menuWidth/2);
        $menu.css("top", top+"px");
        $menu.css("left", left+"px");
        $menu.addClass("menuSetting");
        $menu.addClass("menuActive");
        $ele.addClass("menuSelected");
    } else if ($ele.hasClass("tabButton") && $('.tabButton').length > 1 && !$ele.is("#newArticle") && $("html").hasClass("editing")) {
        $menu.addClass("above");
        $menu.removeClass("bellow");
        left -= menuWidth/2;
        $menu.css("left", left+"px");
        $menu.addClass("menuActive");
        $menu.addClass("menuTabs");
        $ele.addClass("menuSelected");
        menuHeight = $menu.outerHeight();
        let top = $ele.offset().top - menuHeight - 10;
        $menu.css("top", top+"px");
    } else if ($block.length != 0 && $("html").hasClass("editing")) {
        $menu.removeClass("bellow");
        $menu.removeClass("above");
        $menu.css("top", e.pageY-60+"px");
        $menu.css("left", left+"px");
        $menu.addClass("menuActive");

        $content = $ele.closest('.content');

        $block.addClass('domSearch');
        $content.addClass('domSearch');
        let $closest = $ele.closest('.domSearch');
        $block.removeClass('domSearch');
        $content.removeClass('domSearch');

        editorOpen($closest);

        if ($ele.hasClass('columns')) {
          $menu.addClass("menuBlock");
          $menu.addClass("menuColumn");
          $content.addClass("menuSelected");
        } else if (!$closest.is($content)) {
          $block.addClass("menuSelected");
          $menu.addClass("menuBlock");
          $menu.addClass("menuContent");
        } else {
          $content.addClass("menuSelected");
          $block.addClass("menuSelected");
          $menu.addClass("menuBlock");
          $menu.addClass("menuContent");
        }

        if ($block.siblings().length == 0) {
          $menu.addClass("menuBlockNew");
        }
        if ($content.siblings().length == 0 && $content.hasClass('newContent')) {
          $menu.addClass("menuContentNew");
        }
    } else {
        closeMenu();
    }
}
function closeMenu() {
    let $menu = $("menu");
    $menu.css("top", 0);
    $menu.css("left", 0);
    $menu.removeClass("menuActive");
    $(".menuSelected").removeClass("menuSelected");
}

function selectForMenu($ele, prop) {
    let $targetBlock = $(".inEditor");
    let $target = $targetBlock.find("."+prop);

    switch (prop) {
        case "names":
            if ($ele.hasClass("editorRoleInput")) {
                type = "role";
                $ele.parent().addClass("menuSelected");
            } else if ($ele.parent().hasClass("editorNameGroup")) {
                type = "name";
                if ($ele.siblings().length != 1) {
                    $ele.addClass("menuSelected");
                } else {
                    $ele.closest(".editorNamesPair").addClass("menuSelected");
                }
            } else {
                type = "names";
                $ele.addClass("menuSelected");
            }

            let index;
            let subIndex;
            let $names = $(".inEditor .names").children();
            if (type == "role" || type == "name") {
                index = $ele.closest("#editorNamesGroup").children().index($ele.closest(".editorNamesPair"));
                if ($ele.siblings().length > 1) {
                    subIndex = $ele.parent().children().index($ele);
                    let $nameGroup = $($names[index]).children(".nameGroup").children();
                    $($nameGroup[subIndex]).addClass("menuSelected");
                } else {
                    if (type == "role") {
                        $($names[index]).addClass("menuSelected");
                    } else if ($ele.siblings().length != 1) {
                        $($names[index]).find("."+type).addClass("menuSelected");
                    } else {
                        $($names[index]).addClass("menuSelected");
                    }
                }
            } else {
                index = $ele.parent().children().index($ele);
                $($names[index]).addClass("menuSelected");
            }
            break;
        case "imageGroup":
        case "image":
            let $next = $ele.next();
            $next.addClass("menuSelected");
            $ele.addClass("menuSelected");
            if ($next.hasClass("editorImgGrouped")) {
                let index = $ele.parent().children("select").index($ele);
                $($targetBlock.children(".imageGroup").children()[index]).addClass("menuSelected");
            } else {
                $target.addClass("menuSelected");
            }
            break;
        case "text":
            $ele.addClass("menuSelected");
            if ($ele.parent().children("textarea").length > 1) {
                let index = $ele.parent().children("textarea").index($ele);
                $($target[index]).addClass("menuSelected");
            } else {
                $target.addClass("menuSelected");
            }
            break;
        default:
    }
}

$(document).click(function(e) {
    $target = $(e.target);

    if ($target.is("#menuDeleteSetting")) {
        $sel = $(".menuSelected");
        
        if ($sel.hasClass('settingValueInput')) {
        $sel = $sel.prev();
        }
        
        let $group = $sel.closest('.editorGroup');
        if ($group.length == 0) {
        $('.content.inEditor').css($sel.val(), '');
        } else if ($group.data('level') == 'block') {
        $('.block.inEditor').css($sel.val(), '');
        } else {
        let setting = $sel.closest(".settingProperty").data("setting");
        if ($sel.hasClass("settingKeyInput")) {
            delete settings[setting][$sel.val()];
        } else {
            delete settings[setting][$sel.prev().val()];
        }
        updateSettings();
        }
        $sel.parent().remove();
    } else if ($target.is("#menuDeleteContent") || $target.is("#menuDeleteColumn")) {
        let $sel = $('.content.menuSelected');
        let $parent = $sel.parent();
        $sel.remove();
        if ($parent.children().length == 0) {
        $parent.append(newContent());
        }
    } else if ($target.is("#menuDeleteBlock")) {
        $('.block.menuSelected').remove();
    } else if ($target.is("#menuDeleteFade")) {
        $sel = $(".menuSelected");
        let index = $('.tabButton').index($sel)
        $($('.creditsSection')[index]).remove();
        $sel.remove();
    } else if ($target.is("#newContent")) {
        let $content = $('.menuSelected.content');
        if ($content.length == 0) {
        $content = $('.menuSelected.block');
        $content.append(newContent())
        } else {
        $content.after(newContent());
        }
    } else if ($target.is("#newBlock")) {
        let $block = $('.menuSelected.block');
        if ($block.length !== 0) {
        $block.after(`<section class="block" data-direction="rows">${newContent()}</section>`);
        } else {
        $('.menuSelected.columns').append(`<section class="block" data-direction="rows">${newContent()}</section>`);
        }
    } else if ($target.is('#sectionsSettings')) {
        let index = $('.tabButton').index($('.tabButton.menuSelected'));
        console.log(index);
        settingsOpen(true, $($('.creditsSection')[index]));
    }
});

if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
        openMenu(e);
        e.preventDefault();
    }, false);
} else {
    document.attachEvent('oncontextmenu', function() {
        openMenu(e);
        window.event.returnValue = false;
    });
}