var model = {
    currentTag: "",
    selectMultiple: true,
    categ: [],
    activeCateg: "",
    multipleCategs: [],
    linkMap: {},
    links: ".item__link",
    buttonContainer: ".categ",
    updateCateg: function (category) {
        var _ = this,
            index;
        if (_.selectMultiple) {
            if (_.multipleCategs.indexOf(category) === -1) {
                _.multipleCategs.push(category)
            } else {
                index = _.multipleCategs.indexOf(category);
                _.multipleCategs.splice(index, 1);
            }
        } else {
            if (_.activeCateg !== category) {
                _.activeCateg = category;
            }
        }

        _.updatePage();

        // console.log("singe", _.activeCateg, "multiple", _.multipleCategs);
    },
    setMultiple: function () {},
    updatePage: function () {
        var _ = this,
            elements_to_activate = [],
            activeLinks, activeButtons, items;
        console.log(_.linkMap);
        items = document.querySelectorAll(".item"),
            items.forEach(function (item) {
                _.helpers.addClass(item, "hidden");
            });
        if (_.selectMultiple) {
            activeLinks = _.multipleCategs.reduce(function (init, current) {
                return init.concat(_.linkMap[current]);
            }, [])
        } else {
            activeLinks = _.linkMap[_.activeCateg];
        }

        console.log("active links", activeLinks);
    },
    buildHTML: function () {
        /// build buttons
        var fragment = document.createDocumentFragment(),
            _ = this,
            categ = _.categ,
            buttonContainers,
            links;

        categ.forEach(function (categ) {
            var button = _.helpers.buildButton('category-button categ__button categ__button--side', categ, categ);
            fragment.append(button);
        });

        fragment.prepend(_.helpers.buildButton('category-button categ__button categ__button--reset', "Reset Categories", "reset"));

        buttonContainers = Array.prototype.slice.call(document.querySelectorAll(_.buttonContainer));
        buttonContainers.forEach(function (container) {
            container.appendChild(fragment.cloneNode(true));

        });
        ///empty fragment
        fragment.replaceChildren();

        /// go through each link
        links = Array.prototype.slice.call(document.querySelectorAll(_.links));
        links.forEach(function (link) {
            var categories = link.getAttribute("data-category").trim().replace(/\s+/, " ").split(" "),
                button_container = document.createElement("div");
            button_container.setAttribute("class", "item__butons");
            _.categ.forEach(function (category) {
                if (categories.indexOf(category) !== -1) {
                    button_container.append(_.helpers.buildButton('category-button categ__button', category, category));
                }
            });
            link.parentElement.append(button_container);
            ///empty fragment
        });
    },
    bindEvents: function () {
        var navOpen = document.querySelector(".page__open-side-button"),
            pageSide = document.querySelector(".page__side"),
            page = document.querySelector(".page"),
            _ = this;
        navOpen.addEventListener("click", function (e) {
            e.preventDefault();
            if (_.helpers.hasClass(page, "page--side-open")) {
                _.helpers.removeClass(page, "page--side-open")
            } else {
                _.helpers.addClass(page, "page--side-open")
            }
        });
        pageSide.addEventListener("click", function (e) {
            if (!_.helpers.hasAncestor(e.target, document.querySelector(".page__side-inner"))) {
                _.helpers.removeClass(page, "page--side-open");
            }
        });

        /// bind events on buttons

        // on click, add class on all buttons with the same class
        // add hidden class on all associated link --> parent .item

        page.addEventListener("click", function (e) {
            var eventTarget = e.target,
                btnSelector = ".category-button",
                target;
            if (_.helpers.matches(eventTarget, btnSelector)) {
                target = eventTarget.getAttribute("data-trigger")
                _.updateCateg(target)
            }
        })

    },
    helpers: {
        buildButton: function (buttonClass, text, categ) {
            if (buttonClass === 'string') {
                buttonClass = [buttonClass];
            }
            var button = document.createElement("button");
            button.textContent = text;
            button.setAttribute("class", buttonClass);
            button.setAttribute("data-trigger", categ);
            return button;
        },
        appendElem: function (elem, parent) {
            parent.appendChild(elem);
        },
        hasClass: function (elem, className) {
            var classList = elem.className;
            if (classList.indexOf(className) !== -1) return true
            return false
        },
        addClass: function (elem, className) {
            var classNames = elem.className;
            if (!this.hasClass(elem, className)) {
                classNames += " " + className;
                elem.className = classNames;
            }
        },
        removeClass: function (elem, className) {
            var classNames = elem.className;
            if (this.hasClass(elem, className)) {
                classNames = classNames.replace(className, "").trim();
                elem.className = classNames;
            }
        },
        hasAncestor: function (elem, ancestor) {
            return traverseUp(elem, ancestor)


            function traverseUp(elem, ancestor) {
                if (elem.parentElement === null) return false
                if (elem === ancestor) return true
                if (ancestor === elem.parentElement) return true
                else return traverseUp(elem.parentElement, ancestor)
            }
        },
        matches: (function () {
            var matchingFunction = Element.prototype.matches || Element.prototype.msMatchesSelector,
                matches = function (element, selector) {
                    return matchingFunction.call(element, selector);
                };
            return matches;

        })()
    },
    init: function () {
        var _ = this;

        var items = Array.prototype.slice.call(document.querySelectorAll(".items a[data-category]")),
            linkMap = {};
        items.forEach(function (item, index) {
            // presume only a single tag on each link
            var tag = item.getAttribute('data-category').toLowerCase();
            if (!tag) {
                item.setAttribute('data-category', 'uncategorized');
                tag = 'uncategorized';
            }
            // ensure all category tags are lowercase
            item.setAttribute('data-category', tag);
            if (!linkMap[tag]) {
                linkMap[tag] = [item]
            } else {
                linkMap[tag].push(item);
            }
        });

        _.linkMap = linkMap;
        _.categ = Object.keys(linkMap).sort();

        console.log(_)

        _.buildHTML();

        _.bindEvents();
    }
}


model.init();
