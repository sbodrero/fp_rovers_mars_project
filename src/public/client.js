/**
 * Store
 * @type {Immutable.Map<string, Immutable.List<string> | Immutable.Map<string, string> | {}>}
 */
let store = Immutable.Map({
    all_rovers: {},
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
})

/**
 * Select root Elemenent as Root
 * @type {HTMLElement}ƒ
 */
const root = document.getElementById('root')

/**
 * Update store content on update
 * @param store
 * @param newState
 */
const updateStore = (store, newState) => {
    store = store.merge(newState);
    render(root, store);
}

/**
 * Attach Ap to Root
 * @param root
 * @param state
 * @returns {Promise<void>}
 */
const render = async (root, state) => {
    root.innerHTML = App(state);
}

/**
 * Return rover's Name
 * @param roverName
 * @returns {function(): string}
 */
const createRoverHeader = (roverName) => () => `${roverName}`;

/**
 * Create tab's welcome message
 * @param callback
 * @returns {string}
 */
const createTabWelcomeTitle = (callback) => `<h3>Here are ${callback()} informations</h3><hr/>`;

/**
 * Add style on first active tab
 * @param rover
 * @returns {string}
 */
const setActiveTabOnLoad = (rover) => rover === 'Curiosity' ? 'style="display: block"' : '';

/**
 * Show a loader image
 * @returns {string}
 */
const showLoader = () =>`
    <div class="loader">
        <p>Loading...</p>
        <img
            src="./assets/images/giphy.gif"
            alt="Loading"
        />
    </div>
`

/**
 * Create rover info list wrapper
 * @param callback
 * @returns {string}
 */
const createWrapperInfoList = (callback) => `
    <div>
        <ld>
            ${callback()}
        </ld>
    </div>
`

/**
 * Create rover info list content
 * @param rover
 * @returns {function(): string}
 */
const createRoverInfoList = (all_rovers, rover) => () => {
        const { latest_photos } = all_rovers[rover.toLowerCase()];
        const firstPhoto = latest_photos[0];
        const { earth_date, rover : { landing_date, launch_date, status}} = firstPhoto;
        return `
            <dt>Launch Date</dt>
            <dd>${launch_date}</dd>
            <dt>Landing Date</dt>
            <dd>${landing_date}</dd>
            <dt>Status</dt>
            <dd>${status}</dd>
            <dt>Date the most recent photos were taken</dt>
            <dd>${earth_date}</dd>
    `
}

/**
 * Create roves tabContents
 * @param all_rovers
 * @param rovers
 * @returns {string}
 */
const createRoverTabContent = (all_rovers, rovers) => {
    return rovers.map(rover =>
        `<div 
            id="${rover.toLowerCase()}" 
            class="tabContent"
            ${setActiveTabOnLoad(rover)}
            >
            ${createTabWelcomeTitle(createRoverHeader(rover))}
            ${createWrapperInfoList(createRoverInfoList(all_rovers, rover))}
            ${createWrapperGallery(createRoverGallery(all_rovers, rover))}
        </div>
       `
    ).join('')
}

/**
 * Create a div wrapper for gallery elements
 * @param callback
 * @returns {string}
 */
const createWrapperGallery = (callback) => `
    <hr>
    <h2>Latest photos</h2>
    <div class="galleryGrid">
        ${callback()}
    </div>
`

/**
 * Create a div wrapper for item gallery elements
 * @param callback
 * @returns {string}
 */
const createItemWrapperGallery = (callback) => `
    <div>
        ${callback()}
    </div>
`

/**
 * Create a gallery item
 * @param all_rovers
 * @param rover
 * @returns {function(): *}
 */
const createRoverGallery =  (all_rovers, rover) => () => {
    const { latest_photos } = all_rovers[rover.toLowerCase()];
    return latest_photos.map(photo => `
            ${createItemWrapperGallery(galleryItem(photo.img_src, photo.earth_date))}
        `
    ).join('')
}

/**
 * Return a gallery item content
 * @param src
 * @param date
 * @returns {function(): string}
 */
const galleryItem = (src, date) => () => `
    <div>
        <img src="${src}"/>       
        <p>${date}</p>
    </div>
`
/**
 * Create Welcome title
 * @returns {string}
 * @constructor
 */
const WelcomeTitle = () => `
    <h1>Welcome to mars rovers informations panel</h1>
    `
/**
 * Create tablinks wrapper html element
 * @param callback
 * @returns {string}
 */
const createTablinksWrapper = (callback) =>`
    <div class="tab"> 
        ${callback()}
    </div>
`
/**
 * Create TabLinks
 * @param rovers
 * @returns function
 */
const createTabLinks = (rovers) => () => {
    return rovers.map(rover =>`
    <button 
     class="tabLinks" 
     onclick="openRoverTab(event,'${rover.toLowerCase()}')"
    >
    ${rover}
    </button>
    `
    ).join('')
}

/**
 * Render the content or a loader
 * @param all_rovers
 * @param rovers
 * @returns {string}
 */
const renderContentOrLoader = (all_rovers, rovers) => {
    if (Object.keys(all_rovers).length < 3) {
        return showLoader()
    }
    return `
    ${createTablinksWrapper(createTabLinks(rovers))}
    ${createRoverTabContent(all_rovers, rovers)}
    `
}

/**
 * Main dynamic content
 * @param state
 * @returns {string}
 * @constructor
 */
const App = (state) => {
    const { rovers, all_rovers } = state.toJS();
    return `
        <header>
            ${WelcomeTitle()}
        </header>
        <main>
            <section>
                <h2>Please chose a rover</h2>
                ${renderContentOrLoader(all_rovers, rovers)}
            </section>
        </main>
    `
}

/**
 * Load rovers date from api
 * @param roverList
 * @param callback
 */
const loadRoversData = (roverList, callback) => roverList.forEach(rover => callback(rover.toLowerCase()))

/**
 * Load latest image by rover name and update store
 * @param roverName
 */
const getLatestImagsByRoverName = (roverName) => {
    fetch(`http://localhost:3000/latest_photos?roverName=${roverName}`)
        .then(res => res.json())
        .then(latest_photos => {
            const rover = { name: roverName, ...latest_photos}
            const all_rovers = store.get('all_rovers', {});
            updateStore(store, {all_rovers: Object.assign(all_rovers, { [roverName]: {...rover}})})
        })
}

/**
 * Load rovers last images and render app
 */
window.addEventListener('load', () => {
    const rovers = store.get('rovers', []).toJS();
    loadRoversData(rovers, getLatestImagsByRoverName);
    render(root, store);
})

/**
 * Show tab content on click
 * @param evt
 * @param roverName
 */
const openRoverTab = (evt, roverName) => {
    let i, tabContent, tabLinks;

    tabContent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none"
    }

    tabLinks = document.getElementsByClassName("tabLinks");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    document.getElementById(roverName).style.display = "block";
    evt.currentTarget.className += " active";
}
