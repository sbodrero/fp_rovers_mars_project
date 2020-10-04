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
 * @type {HTMLElement}
 */
const root = document.getElementById('root')

/**
 * Update store content on update
 * @param store
 * @param newState
 */
const updateStore = (store, newState) => {
    store = store.merge(newState);
    console.log(store.toJS(), 'store');
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
    <div>
        <p>Loading...</p>
        <img
            src="./assets/images/giphy.webp"
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

const hasNoData = (all_rovers, rover) => !all_rovers || (all_rovers && !all_rovers[rover.toLowerCase()]);

/**
 * Return a rover info list or a loader
 * @param rover
 * @returns {string}
 */
const getRoverInfoTableOrLoader = (all_rovers, rover) => {
    if(hasNoData(all_rovers, rover)) {
        return showLoader();
    }
    return createWrapperInfoList(createRoverInfoList(all_rovers, rover));
}

const getRoverGalleryOrLoader = (all_rovers, rover) => {
    if(hasNoData(all_rovers, rover)) {
        return showLoader();
    }
    return;
}

/**
 * Main dynamic content
 * @param state
 * @returns {string}
 * @constructor
 */
const App = (state) => {
    const { rovers, all_rovers } = state.toJS();
    console.log(Object.keys(all_rovers).length, 'all_rovers.length')
    return `
        <header></header>
        <main>
            ${WelcomeTitle()}
            <section>
                <h2>Welcome to mars rovers informations</h2>
                <div class="tab">                   
                   ${rovers.map(rover =>`
                        <button 
                        class="tablinks" 
                        onclick="openRoverTab(event,'${rover.toLowerCase()}')"
                        >
                            ${rover}
                        </button>
                   `).join('')}
                </div>
                ${Object.keys(all_rovers).length === 3 && rovers.map(rover => 
                    `<div 
                        id="${rover.toLowerCase()}" 
                        class="tabcontent"
                        ${setActiveTabOnLoad(rover)}
                        >
                        ${createTabWelcomeTitle(createRoverHeader(rover))}
                        <div class="homeGrid">
                            ${getRoverInfoTableOrLoader(all_rovers, rover)}
                        </div>
                    </div>
                   `
                ).join('')}
            </section>
        </main>
        <footer></footer>
    `
}

/**
 *
 * @returns {string}
 * @constructor
 */
const WelcomeTitle = () => `
            <h1>Welcome to mars rovers informations panel</h1>
        `

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
const createTabWelcomeTitle = (callback) => `<h3>Welcome to ${callback()} tab</h3>`;

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
    render(root, store)
})

/**
 * Show tab content on click
 * @param evt
 * @param roverName
 */
const openRoverTab = (evt, roverName) => {
    let i, tabContent, tabLinks;

    tabContent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    tabLinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    document.getElementById(roverName).style.display = "block";
    evt.currentTarget.className += " active";
}
