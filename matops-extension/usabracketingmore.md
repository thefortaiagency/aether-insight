<body class="font-gotham antialiased overflow-hidden">
        
        <div id="outer_prompt_frame" style="display:none;position:absolute;top:0;left:0;width:100%;background-color:black;">
            <div id="inner_prompt_frame" class="rounded" style="position:relative;margin:auto;background-color:white;width:90%;max-width:800px;padding:1em;margin-top:1em;margin-bottom:1em;">

            </div>
        </div>

        <div id="page_content" class="min-h-screen bg-white">

            <nav x-data="{ open: false }" class="bg-usa-red border-b-4 border-usa-blue text-white p-1 print:hidden">
    <!-- Primary Navigation Menu -->
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="https://www.usabracketing.com">
                        <img src="https://d2d6fh2s6spiuv.cloudfront.net/site_files/usab_generic_logo_color.png" class="block h-16 w-auto fill-current text-gray-600">
                    </a>
                </div>

                
                <!-- Navigation Links -->
                <div class="space-x-8 -my-px ml-10 flex" id="main_nav_frame"><a href="https://www.usabracketing.com/events">Events</a><a href="https://www.usabracketing.com/seasons">Seasons</a><a href="https://www.usabracketing.com/athletes">Profiles</a><a href="https://www.usabracketing.com/my_account/athletes/800792c9-f818-4f12-88ef-097c66a82f16/dashboard">Dashboard</a><a href="https://www.usabracketing.com/faqs">Support</a></div>
            </div>

            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ml-6">
                <div style="z-index: 2002;" x-data="{ open: false }" @click.outside="open = false" @close.stop="open = false" x-on:close-modal.window="open = false">
    <div @click="open = ! open" class="flex items-center">
        <a class="mr-2 whitespace-nowrap" href="https://www.usabracketing.com/my_account/messages/800792c9-f818-4f12-88ef-097c66a82f16/index">
                                <i class="fa-regular fa-envelope" aria-hidden="true"></i>-18
                            </a>
                                                <a class="mr-2" href="https://www.usabracketing.com/my_account/messages/800792c9-f818-4f12-88ef-097c66a82f16/alerts">
                            <i class="mr-1 fa-regular fa-bell" aria-hidden="true"></i>
                        </a>
                        <button class="flex items-center text-base font-semibold uppercase subpixel-antialiased text-white hover:text-white hover:border-gray-300 focus:outline-none focus:text-white focus:border-gray-300 transition duration-150 ease-in-out">
                            <div class="ml-auto">Andrew</div>
                            <div class="ml-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                        </button>
    </div>

    <div x-show="open" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="transform opacity-0 scale-95" x-transition:enter-end="transform opacity-100 scale-100" x-transition:leave="transition ease-in duration-75" x-transition:leave-start="transform opacity-100 scale-100" x-transition:leave-end="transform opacity-0 scale-95" class="absolute right-4 mt-2 w-36 rounded-md shadow-lg origin-top" style="display: none; z-index:510" @click="open = false">
        <div class="rounded-md ring-1 ring-black ring-opacity-5 py-1 bg-white">
            <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/my_account/athletes/800792c9-f818-4f12-88ef-097c66a82f16/show_profile">My Account</a>
                                                    <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/my_account/athletes/800792c9-f818-4f12-88ef-097c66a82f16/profiles">My Profiles</a>
                                                <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/my_account/events">My Events</a>
                                                    <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/my_account/orgs">My Orgs</a>
                            <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/my_carts">My Orders</a>
                                                <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/my_account/messages/800792c9-f818-4f12-88ef-097c66a82f16/index">Messages</a>
                                                                        <!-- Authentication -->
                        <form method="POST" action="https://www.usabracketing.com/logout">
                            <input type="hidden" name="_token" value="BAFUeGVmo1QHuvEMCt7wxiw6ZfXH8B2SXlGoGwzp" autocomplete="off">
                            <a class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" href="https://www.usabracketing.com/logout" onclick="event.preventDefault();
                                                this.closest('form').submit();">Log Out</a>
                        </form>
        </div>
    </div>
</div>
            </div>

            <!-- Hamburger -->
            <div class="flex items-center sm:hidden">
                                    <a class="mr-2 whitespace-nowrap" href="https://www.usabracketing.com/my_account/messages/800792c9-f818-4f12-88ef-097c66a82f16/index">
                        <i class="fa-regular fa-envelope" aria-hidden="true"></i>-18
                    </a>
                                <a class="mr-2" href="https://www.usabracketing.com/my_account/messages/800792c9-f818-4f12-88ef-097c66a82f16/alerts">
                    <i class="mr-1 fa-regular fa-bell" aria-hidden="true"></i>
                </a>
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-usa-blue focus:outline-none focus:bg-usa-blue focus:text-white transition duration-150 ease-in-out">
                    <p class="text-base font-semibold uppercase pr-2">Andrew</p>
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden bg-usa-blue text-white mt-1">


















        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-gray-200">




            <div class="mt-3 space-y-1">
                <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/my_account/athletes/800792c9-f818-4f12-88ef-097c66a82f16/show_profile">
    My Account
</a>
                                    <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/my_account/athletes/800792c9-f818-4f12-88ef-097c66a82f16/profiles">
    My Profiles
</a>
                                <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/my_account/events">
    My Events
</a>
                                    <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/my_account/orgs">
    My Orgs
</a>
                    <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/my_carts">
    My Orders
</a>
                                <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/my_account/messages/800792c9-f818-4f12-88ef-097c66a82f16/index">
    Messages
</a>
                                                <!-- Authentication -->
                <form method="POST" action="https://www.usabracketing.com/logout">
                    <input type="hidden" name="_token" value="BAFUeGVmo1QHuvEMCt7wxiw6ZfXH8B2SXlGoGwzp" autocomplete="off">
                    <a class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out text-white" href="https://www.usabracketing.com/logout" onclick="event.preventDefault();
                                        this.closest('form').submit();">
    Log Out
</a>
                </form>
            </div>
        </div>
    </div>
    <style>
        #main_nav_frame a {
            margin:auto;
            margin-right:2em;
            text-transform: uppercase;
        }
        #main_nav_frame a:hover {
            border-bottom: 1px solid white;
        }
        #more_main_nav_frame {
            padding:.5em;
            line-height: 3;
        }
        #more_main_nav_frame a {
            margin-right:1em;
            margin-left:1em;
            text-transform: uppercase;
        }
        #more_main_nav_frame a:hover {
            border-bottom: 1px solid white;
        }
        @media (max-width: 500px) {
            #main_nav_frame {
                margin-left:.5em;
            }
            #main_nav_frame a {
                margin:auto;
                margin-left:.5em;
                margin-right:.5em;
            }
        }
    </style>
    <div id="more_main_nav_frame" style="text-align:center;display:none;justify-content: center;flex-wrap:wrap;"></div>
    <script>
        var menuLinks = {"Events":"https:\/\/www.usabracketing.com\/events","Seasons":"https:\/\/www.usabracketing.com\/seasons","Profiles":"https:\/\/www.usabracketing.com\/athletes","Dashboard":"https:\/\/www.usabracketing.com\/my_account\/athletes\/800792c9-f818-4f12-88ef-097c66a82f16\/dashboard","Support":"https:\/\/www.usabracketing.com\/faqs"};
        var tabArr = new Array();
        var obj;
        var tab = "";
        for (const key in menuLinks) {
            if (menuLinks.hasOwnProperty(key)) {
                obj = new Object();
                obj.label = key;
                obj.url = menuLinks[key];
                obj.target = "";
                if(typeof obj.url==='object' && obj.url!=null){
                    obj.url = obj.url.url;
                    obj.target = obj.url.target;
                }
                obj.min_win_size = 0;
                tabArr[tabArr.length] = obj;
                try{
                    if(tab=="" && obj.url.startsWith("https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers")){
                        tab = obj.label;
                    }
                }catch(e){}
            }
        }
        new Tabs(tabArr, tab, "main_nav_frame", "more_main_nav_frame", 12, 30, 350, false);
    </script>
</nav>

            <!-- Page Heading -->
            <header class="bg-white shadow border-b-4 border-usa-blue print:hidden">
                <div class="mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="py-6 px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-6">
                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5">
                                                                        <img src="https://d2d6fh2s6spiuv.cloudfront.net/events/420e5e7f-184f-4723-a9f0-008cef564cd5/logo/h3Bfng1vO8kjlJKeCCwSDOK81w0xcXiElk6bwmEb.png" alt="IndianaMat Hoosier Preseason Open logo" class="h-16 flex-none rounded-full ring-1 ring-gray-900/10" onerror="this.onerror=null;this.src='https://d2d6fh2s6spiuv.cloudfront.net/site_files/usab_generic_logo_color.png'">
                                                            </a>
                <h1 class="font-semibold text-xl text-gray-800 leading-tight">
                    <div class="text-xl font-bold sm:text-2xl leading-6 text-gray-800">
                        <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5">IndianaMat Hoosier Preseason Open</a>
                                                    <a class="pl-2 basic_link" href="javascript:toggleUserFilter()"><i class="fa-solid fa-filter" aria-hidden="true"></i></a>
                                            </div>
                    <div class="mt-1 text-base font-semibold leading-6 text-gray-800">
                        <sub>
                            09/07/2025
                                                                                                                                                </sub>
                    </div>
                </h1>
            </div>
            <div id="user_filter_frame" style="display:none;text-align:center;padding:1em;line-height: 2;">
                                                    <span style="padding-right:1em;">
                        <input type="checkbox" id="user_division_fad123d1-39a6-4f3a-9b37-c2a360227ef4"> High School
                    </span>
                                <a style="border-radius:.5em;" class="bg-usa-red text-white p-2 mr-2" href="javascript:clearFilter()">Clear</a>
                <a style="border-radius:.5em;white-space: nowrap;" class="bg-usa-blue text-white p-2" href="javascript:applyFilter()">Apply Filter</a>
            </div>
        </div>
                    
                                    </div>
            </header>
            <div class="print:hidden">
                                    <div>
                <div wire:snapshot="{&quot;data&quot;:{&quot;base_menu&quot;:[[[{&quot;id&quot;:97,&quot;parent_id&quot;:99,&quot;label&quot;:&quot;&lt;i class=\&quot;fa-solid fa-house\&quot;&gt;&lt;\/i&gt;&quot;,&quot;url&quot;:&quot;\/events\/[recordId]&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:1,&quot;created_at&quot;:&quot;2023-07-19T15:46:32.000000Z&quot;,&quot;updated_at&quot;:&quot;2024-02-20T17:13:14.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;condition_codes&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:85,&quot;parent_id&quot;:99,&quot;label&quot;:&quot;General&quot;,&quot;url&quot;:null,&quot;target&quot;:null,&quot;sort&quot;:2,&quot;created_at&quot;:&quot;2023-07-07T11:54:08.000000Z&quot;,&quot;updated_at&quot;:&quot;2024-02-20T17:13:14.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;not_event_admin&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[[{&quot;id&quot;:89,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Announcements&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/announcements&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:1,&quot;created_at&quot;:&quot;2023-07-07T12:16:18.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:86,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Bracket Types&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/bracket_types&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:2,&quot;created_at&quot;:&quot;2023-07-07T11:54:45.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:43,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Brackets&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/brackets&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:3,&quot;created_at&quot;:&quot;2023-03-03T19:57:14.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;not_single_dual&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:42,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Dashboard&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/dashboard&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:4,&quot;created_at&quot;:&quot;2023-03-03T19:55:14.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;current_event&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:87,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Divisions&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/divisions&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:5,&quot;created_at&quot;:&quot;2023-07-07T12:08:29.000000Z&quot;,&quot;updated_at&quot;:&quot;2024-01-31T13:32:59.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;not_single_dual&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:92,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Dual Pools&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/pools&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:6,&quot;created_at&quot;:&quot;2023-07-07T15:26:40.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;multi_dual&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:130,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Information&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/info&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:7,&quot;created_at&quot;:&quot;2023-10-11T12:57:56.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:90,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Mats&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/mats&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:8,&quot;created_at&quot;:&quot;2023-07-07T14:45:42.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;not_single_dual&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:63,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;My Wrestlers&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/my_wrestlers&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:9,&quot;created_at&quot;:&quot;2023-05-18T14:32:48.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:91,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Officials&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/officials&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:10,&quot;created_at&quot;:&quot;2023-07-07T15:01:15.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:93,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Period Lengths&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/period_lengths&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:11,&quot;created_at&quot;:&quot;2023-07-07T15:39:05.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:66,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Registration&quot;,&quot;url&quot;:null,&quot;target&quot;:null,&quot;sort&quot;:12,&quot;created_at&quot;:&quot;2023-06-20T18:33:23.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;reg_open&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[[{&quot;id&quot;:69,&quot;parent_id&quot;:66,&quot;label&quot;:&quot;Register Now&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/registration\/register\/transaction&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:1,&quot;created_at&quot;:&quot;2023-06-22T17:36:10.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-09-18T18:06:16.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;dont_limit_reg_to_team_admins&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:68,&quot;parent_id&quot;:66,&quot;label&quot;:&quot;Matrix&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/registration\/register\/matrix&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:2,&quot;created_at&quot;:&quot;2023-06-22T17:35:40.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-07-20T17:32:13.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;show_matrix&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:67,&quot;parent_id&quot;:66,&quot;label&quot;:&quot;Wrestler List&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/registration\/register\/wrestler_list&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:3,&quot;created_at&quot;:&quot;2023-06-20T18:34:20.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-07-20T17:32:22.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;show_wrestler_list&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}]],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:47,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Reports&quot;,&quot;url&quot;:null,&quot;target&quot;:null,&quot;sort&quot;:13,&quot;created_at&quot;:&quot;2023-03-03T19:58:41.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[[{&quot;id&quot;:73,&quot;parent_id&quot;:47,&quot;label&quot;:&quot;Individual Reports&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/printing\/matches\/form&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:1,&quot;created_at&quot;:&quot;2023-06-29T18:44:01.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-07-20T19:25:40.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;ind_event&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:74,&quot;parent_id&quot;:47,&quot;label&quot;:&quot;Dual Reports&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/printing\/duals\/form&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:2,&quot;created_at&quot;:&quot;2023-06-29T18:44:19.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-07-20T19:25:34.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;dual_event&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:75,&quot;parent_id&quot;:47,&quot;label&quot;:&quot;Dual Weight Results&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/printing\/dual_weight_results\/form&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:3,&quot;created_at&quot;:&quot;2023-06-29T18:45:02.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-07-20T19:25:20.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;dual_event&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}]],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:94,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Rounds&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/rounds&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:14,&quot;created_at&quot;:&quot;2023-07-07T20:18:27.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;not_single_dual&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:95,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Seed Criteria&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/seed_criteria&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:15,&quot;created_at&quot;:&quot;2023-07-07T20:23:37.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:&quot;not_single_dual&quot;,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:125,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Statistics&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/stats&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:16,&quot;created_at&quot;:&quot;2023-10-06T13:27:34.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:96,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Team Scoring&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/team_scoring\/activity&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:17,&quot;created_at&quot;:&quot;2023-07-10T12:05:12.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:44,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Teams&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/teams&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:18,&quot;created_at&quot;:&quot;2023-03-03T19:57:34.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:46,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Weights&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/weights&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:19,&quot;created_at&quot;:&quot;2023-03-03T19:58:20.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;id&quot;:45,&quot;parent_id&quot;:85,&quot;label&quot;:&quot;Wrestlers&quot;,&quot;url&quot;:&quot;\/events\/[recordId]\/wrestlers&quot;,&quot;target&quot;:&quot;_self&quot;,&quot;sort&quot;:20,&quot;created_at&quot;:&quot;2023-03-03T19:58:02.000000Z&quot;,&quot;updated_at&quot;:&quot;2023-10-11T12:58:07.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;worker_permission_id&quot;:null,&quot;condition_code&quot;:null,&quot;gates&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;children&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}]],{&quot;s&quot;:&quot;arr&quot;}],&quot;condition_codes&quot;:[[[{&quot;navigation_item_id&quot;:85,&quot;condition_code&quot;:&quot;active_event&quot;,&quot;created_at&quot;:&quot;2024-02-20T16:26:42.000000Z&quot;,&quot;updated_at&quot;:&quot;2024-02-20T16:26:42.000000Z&quot;,&quot;deleted_at&quot;:null},{&quot;s&quot;:&quot;arr&quot;}],[{&quot;navigation_item_id&quot;:85,&quot;condition_code&quot;:&quot;not_event_admin&quot;,&quot;created_at&quot;:&quot;2024-02-20T16:26:42.000000Z&quot;,&quot;updated_at&quot;:&quot;2024-02-20T16:26:42.000000Z&quot;,&quot;deleted_at&quot;:null},{&quot;s&quot;:&quot;arr&quot;}]],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}]],{&quot;s&quot;:&quot;arr&quot;}],&quot;can_select_role&quot;:false,&quot;child_menu&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;event&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\Event&quot;,&quot;key&quot;:&quot;420e5e7f-184f-4723-a9f0-008cef564cd5&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;listeners&quot;:[[&quot;menuClicked&quot;,&quot;selectRole&quot;],{&quot;s&quot;:&quot;arr&quot;}],&quot;parent_menu&quot;:null,&quot;permissions&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;roles&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;show_menu&quot;:false,&quot;user&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\User&quot;,&quot;key&quot;:&quot;800792c9-f818-4f12-88ef-097c66a82f16&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;menu&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\NavigationItem&quot;,&quot;key&quot;:99,&quot;s&quot;:&quot;mdl&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;h62GmJsIU5dabBmaxpEJ&quot;,&quot;name&quot;:&quot;menu&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;5b558d2c896a8cb4c2c90b2f8453dfea348faf798feeb2e0b612d385e6468039&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;menuClicked&quot;,&quot;selectRole&quot;]}" wire:id="h62GmJsIU5dabBmaxpEJ" class="relative isolate shadow" style="z-index:2001;" x-data="{
    showMenu: window.Livewire.find('h62GmJsIU5dabBmaxpEJ').entangle('show_menu'),
    permissions: [],
    event: {&quot;id&quot;:&quot;420e5e7f-184f-4723-a9f0-008cef564cd5&quot;,&quot;name&quot;:&quot;IndianaMat Hoosier Preseason Open&quot;,&quot;start_date&quot;:&quot;2025-09-07T05:00:00.000000Z&quot;,&quot;end_date&quot;:&quot;2025-09-07T05:00:00.000000Z&quot;,&quot;facility&quot;:&quot;Allen County War Memorial Coliseum&quot;,&quot;address&quot;:&quot;4000 Parnell Ave&quot;,&quot;city&quot;:&quot;Fort Wayne&quot;,&quot;state_id&quot;:15,&quot;zip&quot;:&quot;46805&quot;,&quot;timezone&quot;:&quot;America\/New_York&quot;,&quot;reg_url&quot;:null,&quot;logo_url&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/logo\/h3Bfng1vO8kjlJKeCCwSDOK81w0xcXiElk6bwmEb.png&quot;,&quot;website_url&quot;:&quot;https:\/\/indianamat.com\/index.php?\/articles.html\/indianamat-hoosier-preseason-open\/2025-indianamat-hoosier-preseason-open-september-7th-r1456\/&quot;,&quot;flyer_url&quot;:null,&quot;event_type&quot;:&quot;I&quot;,&quot;gov_body_id&quot;:&quot;27a12318-1ad8-47b7-a9e0-15197a9f3cf0&quot;,&quot;created_at&quot;:&quot;2025-07-11T19:12:07.000000Z&quot;,&quot;updated_at&quot;:&quot;2025-09-09T13:31:56.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;max_seed_jump&quot;:1,&quot;roster_entry_deadline&quot;:&quot;2025-09-02T00:59:00.000000Z&quot;,&quot;seed_criteria_deadline&quot;:null,&quot;release_lineups_to_teams&quot;:null,&quot;release_to_public&quot;:&quot;2025-07-11T19:16:00.000000Z&quot;,&quot;block_settings&quot;:null,&quot;period_length_id&quot;:&quot;cd779691-b72f-4e21-8914-8c5241097d10&quot;,&quot;assign_mats_settings&quot;:{&quot;mat_ids&quot;:null,&quot;round_ids&quot;:null,&quot;session_ids&quot;:null,&quot;division_ids&quot;:null,&quot;assignment_method&quot;:&quot;order&quot;},&quot;discipline_id&quot;:8,&quot;champ_adv_points&quot;:null,&quot;cons_adv_points&quot;:null,&quot;place_adv_points&quot;:null,&quot;bye_adv_option_id&quot;:3,&quot;bye_activity_option_id&quot;:3,&quot;mat_assignment_depth&quot;:3,&quot;scramble_settings&quot;:null,&quot;min_break_time&quot;:30,&quot;print_card_settings&quot;:null,&quot;print_bout_settings&quot;:null,&quot;print_weigh_in_sheet_settings&quot;:{&quot;show&quot;:&quot;all&quot;,&quot;columns&quot;:[&quot;usaw_id&quot;,&quot;first_name&quot;,&quot;last_name&quot;,&quot;team_name&quot;,&quot;team_abbr&quot;,&quot;team_gender&quot;,&quot;weight&quot;,&quot;seed&quot;,&quot;place&quot;,&quot;weight_division&quot;,&quot;division_weight&quot;,&quot;weights&quot;,&quot;qualifiers&quot;,&quot;divisions&quot;,&quot;state&quot;,&quot;actual_weight&quot;,&quot;df_seeding_criteria&quot;,&quot;df_grade&quot;,&quot;df_allow_college_coach&quot;,&quot;df_final_seeding_criteria&quot;,&quot;df_weigh-_in_notes&quot;,&quot;qual_name&quot;,&quot;qual_place&quot;,&quot;wrestler_counter&quot;,&quot;wrestler_id&quot;,&quot;profile_id&quot;,&quot;profile_email&quot;,&quot;profile_dob&quot;,&quot;profile_city&quot;,&quot;profile_state_name&quot;,&quot;profile_state_abbr&quot;,&quot;profile_gender&quot;],&quot;team_ids&quot;:null,&quot;font_size&quot;:&quot;10&quot;,&quot;order_by_1&quot;:&quot;weight&quot;,&quot;order_by_2&quot;:&quot;name&quot;,&quot;order_by_3&quot;:null,&quot;order_by_4&quot;:null,&quot;page_break&quot;:null,&quot;weight_ids&quot;:null,&quot;rows_per_sheet&quot;:&quot;1000&quot;,&quot;weight_division_ids&quot;:null,&quot;wrestler_division_ids&quot;:null},&quot;matrix_template&quot;:0,&quot;live_scoring_template_id&quot;:null,&quot;dashboard_extension_template_id&quot;:null,&quot;activated_registration&quot;:1,&quot;reg_limit&quot;:950,&quot;default_price&quot;:45,&quot;count_registration&quot;:&quot;P&quot;,&quot;lock_teams&quot;:0,&quot;lock_wrestlers&quot;:0,&quot;lock_wrestler_divisions&quot;:1,&quot;lock_wrestler_weights&quot;:0,&quot;use_weight_as_min&quot;:1,&quot;show_matrix&quot;:1,&quot;show_wrestler_list&quot;:0,&quot;waiver_url&quot;:null,&quot;usaw_event_id&quot;:null,&quot;reg_require_division&quot;:1,&quot;reg_require_weight&quot;:1,&quot;onsite_payment_info&quot;:null,&quot;contact_email&quot;:&quot;joe@indianamat.com&quot;,&quot;contact_phone&quot;:0,&quot;wrestler_entry_limit&quot;:950,&quot;team_weight_limit&quot;:0,&quot;session_count&quot;:0,&quot;financially_settled&quot;:1,&quot;active&quot;:1,&quot;bye_distribution&quot;:&quot;random&quot;,&quot;use_video&quot;:1,&quot;use_charts&quot;:0,&quot;limit_reg_to_team_admins&quot;:0,&quot;team_entry_limit&quot;:null,&quot;dual_id&quot;:null,&quot;gender&quot;:&quot;M&quot;,&quot;live_scoring&quot;:1,&quot;allow_challenges&quot;:0,&quot;state_scoring&quot;:0,&quot;ach_account_id&quot;:&quot;724a2e03-ef93-453c-816d-b449151933be&quot;,&quot;pp_user_id&quot;:&quot;2303f944-9eda-48a0-9822-67912047fb31&quot;,&quot;pp_datetime&quot;:&quot;2025-07-11T19:19:04.000000Z&quot;,&quot;uploaded_result_wrestler_data_field_id&quot;:null,&quot;fetch_uploaded_result_type&quot;:null,&quot;fetch_usaw_results&quot;:0,&quot;process_uploaded_results&quot;:0,&quot;accept_usa_limited_folkstyle&quot;:0,&quot;flo_event_id&quot;:null,&quot;allow_entity_linking&quot;:0,&quot;copy_token&quot;:&quot;9TBXhY4yYnEbb90X&quot;,&quot;copy_expiration&quot;:&quot;2025-09-08T12:31:18.000000Z&quot;,&quot;public_lock&quot;:null,&quot;media_emails_sent&quot;:1,&quot;fantasy&quot;:1,&quot;team_label&quot;:null,&quot;reg_header_html&quot;:null,&quot;wrestler_division_limit&quot;:950,&quot;look_ahead&quot;:10,&quot;min_go_minutes&quot;:10,&quot;flo_udp&quot;:0,&quot;obs_studio&quot;:1,&quot;weight_units&quot;:&quot;lbs&quot;,&quot;allow_estimated_go_times&quot;:1,&quot;divisions&quot;:[{&quot;id&quot;:&quot;fad123d1-39a6-4f3a-9b37-c2a360227ef4&quot;,&quot;event_id&quot;:&quot;420e5e7f-184f-4723-a9f0-008cef564cd5&quot;,&quot;name&quot;:&quot;High School&quot;,&quot;abbr&quot;:&quot;HS&quot;,&quot;sort&quot;:1,&quot;created_at&quot;:&quot;2025-07-11T19:14:09.000000Z&quot;,&quot;updated_at&quot;:&quot;2025-09-07T16:16:01.000000Z&quot;,&quot;deleted_at&quot;:null,&quot;period_length_id&quot;:&quot;cd779691-b72f-4e21-8914-8c5241097d10&quot;,&quot;discipline_id&quot;:8,&quot;event_status&quot;:&quot;A&quot;,&quot;created_by_id&quot;:null,&quot;weight_group_id&quot;:null,&quot;weight_units&quot;:null}]},
    baseMenu: window.Livewire.find('h62GmJsIU5dabBmaxpEJ').entangle('base_menu'),
    parentMenu: window.Livewire.find('h62GmJsIU5dabBmaxpEJ').entangle('parent_menu'),
    childMenu: window.Livewire.find('h62GmJsIU5dabBmaxpEJ').entangle('child_menu'),
    activeBaseMenuId: null,
    show() {
        this.showMenu = true;
    },
    close() {
        if (! this.showMenu) return

        this.showMenu = false
    },
    onBaseMenuClick(menuItem) {
        // don't make another request if its the same
        // link
        if(this.activeBaseMenuId === menuItem.id) {
            this.close();
            this.activeBaseMenuId = null;
            return;
        }

        this.activeBaseMenuId = menuItem.id;

        $wire.menuClicked(menuItem.id)
    },
    onSelectRoleClick() {
        if(this.showMenu === true &amp;&amp; this.activeBaseMenuId === null) {// &amp;&amp; this.activeBaseMenuId !==) {
            this.close();
            return;
        }

        $wire.showRoles();
        this.activeBaseMenuId = null;
    }
    }" @click.outside="close()">
    <div class="bg-white mx-auto px-4 sm:px-6 lg:px-8 mb-5 md:h-16 h-[88px] flex items-center overflow-x-scroll md:overflow-auto">
        <div class="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
            <div class="flex gap-x-10 h-full items-center">
                <template x-for="menuItem in baseMenu" :key="menuItem.id">
                    <div>
                        <template x-if="menuItem.children.length === 0">
                            <a x-bind:href="menuItem.url?.replace('[recordId]', event.id)" x-bind:target="menuItem.target" class="inline-flex items-center gap-x-1 leading-6 text-gray-900" aria-expanded="false" x-html="menuItem.label">
                            </a>
                        </template>
                        <template x-if="menuItem.children.length &gt; 0">
                            <button type="button" class="inline-flex items-center gap-x-1 leading-6 text-gray-900 " aria-expanded="false" x-on:click="onBaseMenuClick(menuItem)">
                                <span class="whitespace-nowrap md:overflow-auto" x-html="menuItem.label"></span>
                                <i class="fa-solid fa-chevron-down fa-2xs"></i>
                            </button>
                        </template>
                    </div>
                </template><div>
                        <template x-if="menuItem.children.length === 0">
                            <a x-bind:href="menuItem.url?.replace('[recordId]', event.id)" x-bind:target="menuItem.target" class="inline-flex items-center gap-x-1 leading-6 text-gray-900" aria-expanded="false" x-html="menuItem.label">
                            </a>
                        </template><a x-bind:href="menuItem.url?.replace('[recordId]', event.id)" x-bind:target="menuItem.target" class="inline-flex items-center gap-x-1 leading-6 text-gray-900" aria-expanded="false" x-html="menuItem.label" href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5" target="_self"><i class="fa-solid fa-house" aria-hidden="true"></i></a>
                        <template x-if="menuItem.children.length &gt; 0">
                            <button type="button" class="inline-flex items-center gap-x-1 leading-6 text-gray-900 " aria-expanded="false" x-on:click="onBaseMenuClick(menuItem)">
                                <span class="whitespace-nowrap md:overflow-auto" x-html="menuItem.label"></span>
                                <i class="fa-solid fa-chevron-down fa-2xs"></i>
                            </button>
                        </template>
                    </div><div>
                        <template x-if="menuItem.children.length === 0">
                            <a x-bind:href="menuItem.url?.replace('[recordId]', event.id)" x-bind:target="menuItem.target" class="inline-flex items-center gap-x-1 leading-6 text-gray-900" aria-expanded="false" x-html="menuItem.label">
                            </a>
                        </template>
                        <template x-if="menuItem.children.length &gt; 0">
                            <button type="button" class="inline-flex items-center gap-x-1 leading-6 text-gray-900 " aria-expanded="false" x-on:click="onBaseMenuClick(menuItem)">
                                <span class="whitespace-nowrap md:overflow-auto" x-html="menuItem.label"></span>
                                <i class="fa-solid fa-chevron-down fa-2xs"></i>
                            </button>
                        </template><button type="button" class="inline-flex items-center gap-x-1 leading-6 text-gray-900 " aria-expanded="false" x-on:click="onBaseMenuClick(menuItem)">
                                <span class="whitespace-nowrap md:overflow-auto" x-html="menuItem.label">General</span>
                                <i class="fa-solid fa-chevron-down fa-2xs" aria-hidden="true"></i>
                            </button>
                    </div>
                <div x-show="$wire.can_select_role" style="display: none;">
                    <button type="button" class="inline-flex items-center gap-x-1 leading-6 text-gray-900" aria-expanded="false" x-on:click="onSelectRoleClick()">
                        <span class="whitespace-nowrap md:overflow-auto">Select Role</span>
                        <i class="fa-solid fa-chevron-down fa-2xs" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div x-show="showMenu" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-1" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 -translate-y-1" class="absolute inset-x-0 top-0 z-auto bg-white mt-24 sm:mt-16 shadow-lg ring-1 ring-gray-900/5" wire:loading.class="blur-sm" style="display: none;">
        <div class="mx-auto grid grid-cols-1 gap-x-8 gap-y-10 px-6 pb-5 lg:px-8">
            <div class="grid grid-rows-11 grid-flow-col md:grid-rows-7 gap-2">
                <template x-if="parentMenu">
                    <div class="-my-2 flex justify-start items-center">
                        <a class="flex items-center justify-center gap-x-4 p-4 text-sm font-semibold leading-6 text-gray-900 cursor-pointer" x-on:click="$wire.menuClicked(parentMenu.parent_id, parentMenu.parent_id)">
                            <i class="fa-solid fa-chevron-left fa-2xs"></i>
                            <span x-text="`Back to ${parentMenu?.label}`"></span>
                        </a>
                    </div>
                </template>
                <template x-for="navItem in childMenu" :key="navItem.id">
                        <div class="-my-2 flex justify-start items-center">
                            <template x-if="navItem.children.length === 0">
                                <a x-bind:href="navItem.url?.replace('[recordId]', event.id)" x-bind:target="navItem.target" class="flex gap-x-4 p-4 text-sm font-semibold leading-6 text-gray-900" x-text="navItem.label">
                                </a>
                            </template>
                            <template x-if="navItem.children.length &gt; 0">
                                <a class="flex gap-x-4 p-4 text-sm font-semibold leading-6 text-gray-900 cursor-pointer" x-text="navItem.label" x-on:click="$wire.menuClicked(navItem.id)">
                                </a>
                            </template>
                        </div>
                </template>
            </div>
        </div>
    </div>
</div>
            </div>
                                            </div>
            <!-- Page Content -->
            <main class="mx-auto px-4 sm:px-6 lg:px-8">
                                                    <div class="flex flex-col">
                        <div class="lg:flex lg:items-center lg:justify-between" x-data="{ expanded: false }">
    <div class="min-w-0 flex-1">
        <h2 class="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight flex">
            My Wrestlers
                    </h2>
        
            </div>

    </div>
                    </div>
                    <div>
                        <div class="tabs print:hidden" id="tabs_frame"><a class="current" href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers">My Wrestlers</a><a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/printing/matches/form">Ind. Reports</a><a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/coach_groups">Coaches</a></div>
    <div style="position:relative;width:100%;background-color:white;">
        <div style="position:absolute;width:100%;display:none;z-index:1001;background-color:white;" class="more_tabs print:hidden" id="more_tabs_frame"></div>
    </div>
<script>
    var navLinks = {"My Wrestlers":"https:\/\/www.usabracketing.com\/events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers","Ind. Reports":"https:\/\/www.usabracketing.com\/events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/printing\/matches\/form","Coaches":"https:\/\/www.usabracketing.com\/events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/coach_groups"};
    var tabArr = new Array();
    var obj;
    var tab = "";
    for (const key in navLinks) {
        if (navLinks.hasOwnProperty(key)) {
            obj = new Object();
            obj.label = key;
            obj.url = navLinks[key];
            obj.target = "";
            if(typeof obj.url==='object' && obj.url!=null){
                obj.url = obj.url.url;
                obj.target = obj.url.target;
            }
            obj.min_win_size = 0;
            tabArr[tabArr.length] = obj;
            try{
                if(tab=="" && obj.url.startsWith("https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers")){
                    tab = obj.label;
                }
            }catch(e){}
        }
    }
    new Tabs(tabArr, tab, "tabs_frame", "more_tabs_frame", 10, 50, 50);
</script>
                    </div>
                    <div>
                        <div class="w-full py-4">

        
        
        <div style="text-align: right;">
                            <button type="button" class="button bg-usa-blue disabled:cursor-not-allowed ml-4 bg-usa-blue" onclick="goTo('edit_wrestlers')">
            Edit Wrestlers
    </button>
                                        <button type="button" class="button bg-usa-blue disabled:cursor-not-allowed ml-4 bg-usa-blue" onclick="goTo('edit_teams')">
            Edit Teams
    </button>
                                        <button type="button" class="button bg-usa-blue disabled:cursor-not-allowed ml-4 bg-usa-blue" onclick="shareMyWrestlers()">
            Share
    </button>
                    </div>

        <div id="share_frame" style="display:none;padding:1em;text-align:center;">
                        <div style="margin:auto;display:inline-block"><!--?xml version="1.0" encoding="UTF-8"?-->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="200" height="200" viewBox="0 0 200 200"><rect x="0" y="0" width="200" height="200" fill="#ffffff"></rect><g transform="scale(4.444)"><g transform="translate(0,0)"><path fill-rule="evenodd" d="M9 0L9 1L8 1L8 2L9 2L9 3L8 3L8 4L9 4L9 5L8 5L8 7L9 7L9 5L10 5L10 8L6 8L6 9L5 9L5 8L0 8L0 10L1 10L1 12L2 12L2 13L0 13L0 18L1 18L1 16L2 16L2 15L3 15L3 16L5 16L5 15L7 15L7 16L6 16L6 17L5 17L5 18L6 18L6 19L7 19L7 20L3 20L3 17L2 17L2 19L0 19L0 21L2 21L2 20L3 20L3 22L1 22L1 24L0 24L0 27L1 27L1 29L0 29L0 31L2 31L2 33L1 33L1 34L2 34L2 33L5 33L5 32L6 32L6 33L7 33L7 34L6 34L6 35L7 35L7 36L6 36L6 37L7 37L7 36L8 36L8 39L9 39L9 37L10 37L10 36L9 36L9 35L11 35L11 38L10 38L10 39L11 39L11 40L8 40L8 45L9 45L9 44L10 44L10 45L11 45L11 44L10 44L10 43L12 43L12 44L13 44L13 45L14 45L14 44L15 44L15 43L16 43L16 45L17 45L17 42L18 42L18 45L19 45L19 44L21 44L21 43L20 43L20 42L22 42L22 43L24 43L24 42L25 42L25 40L26 40L26 41L27 41L27 42L26 42L26 44L27 44L27 45L28 45L28 44L33 44L33 45L34 45L34 44L33 44L33 43L37 43L37 44L36 44L36 45L37 45L37 44L38 44L38 45L39 45L39 44L38 44L38 43L39 43L39 42L36 42L36 41L40 41L40 42L41 42L41 39L42 39L42 40L43 40L43 41L42 41L42 42L43 42L43 41L45 41L45 39L44 39L44 38L45 38L45 35L44 35L44 34L45 34L45 33L44 33L44 32L45 32L45 31L44 31L44 30L45 30L45 28L44 28L44 29L43 29L43 31L42 31L42 32L43 32L43 33L41 33L41 32L40 32L40 33L39 33L39 31L38 31L38 28L39 28L39 27L38 27L38 26L37 26L37 27L38 27L38 28L36 28L36 25L41 25L41 26L40 26L40 29L41 29L41 28L43 28L43 27L44 27L44 26L45 26L45 25L43 25L43 26L42 26L42 24L43 24L43 23L44 23L44 24L45 24L45 23L44 23L44 22L45 22L45 21L44 21L44 20L43 20L43 19L44 19L44 18L45 18L45 17L44 17L44 14L45 14L45 13L44 13L44 12L43 12L43 11L44 11L44 10L45 10L45 9L44 9L44 8L43 8L43 9L42 9L42 8L41 8L41 9L40 9L40 8L39 8L39 9L40 9L40 10L41 10L41 11L39 11L39 10L38 10L38 11L37 11L37 9L38 9L38 8L37 8L37 6L36 6L36 8L37 8L37 9L35 9L35 8L34 8L34 7L35 7L35 6L34 6L34 5L37 5L37 3L36 3L36 1L37 1L37 0L36 0L36 1L35 1L35 4L34 4L34 5L33 5L33 4L31 4L31 3L34 3L34 2L33 2L33 1L32 1L32 0L30 0L30 1L31 1L31 3L29 3L29 2L28 2L28 0L27 0L27 1L26 1L26 0L25 0L25 1L23 1L23 2L24 2L24 3L22 3L22 0L21 0L21 1L20 1L20 0L19 0L19 1L20 1L20 2L21 2L21 3L19 3L19 2L17 2L17 3L16 3L16 2L14 2L14 0L13 0L13 2L14 2L14 3L16 3L16 4L12 4L12 3L11 3L11 1L10 1L10 0ZM15 0L15 1L16 1L16 0ZM9 1L9 2L10 2L10 1ZM25 1L25 2L26 2L26 3L25 3L25 5L27 5L27 7L26 7L26 6L25 6L25 7L26 7L26 9L24 9L24 10L23 10L23 9L20 9L20 8L19 8L19 7L20 7L20 4L16 4L16 5L15 5L15 8L16 8L16 9L13 9L13 10L14 10L14 11L13 11L13 12L14 12L14 13L12 13L12 12L11 12L11 11L12 11L12 9L11 9L11 8L14 8L14 6L13 6L13 5L12 5L12 6L11 6L11 8L10 8L10 13L9 13L9 11L8 11L8 9L6 9L6 10L5 10L5 9L1 9L1 10L2 10L2 12L3 12L3 13L2 13L2 14L1 14L1 15L2 15L2 14L3 14L3 15L5 15L5 13L6 13L6 14L7 14L7 15L9 15L9 17L8 17L8 16L7 16L7 17L6 17L6 18L9 18L9 19L8 19L8 20L9 20L9 23L11 23L11 22L12 22L12 20L13 20L13 19L16 19L16 20L17 20L17 21L15 21L15 20L14 20L14 21L13 21L13 22L14 22L14 21L15 21L15 24L16 24L16 25L13 25L13 26L14 26L14 27L13 27L13 29L15 29L15 30L13 30L13 31L11 31L11 32L10 32L10 30L9 30L9 29L10 29L10 27L11 27L11 28L12 28L12 27L11 27L11 26L12 26L12 25L10 25L10 24L9 24L9 25L8 25L8 26L7 26L7 25L6 25L6 26L7 26L7 27L6 27L6 28L5 28L5 27L4 27L4 25L3 25L3 26L2 26L2 24L1 24L1 27L3 27L3 29L1 29L1 30L2 30L2 31L3 31L3 32L4 32L4 31L6 31L6 32L7 32L7 33L10 33L10 34L11 34L11 35L12 35L12 37L13 37L13 38L14 38L14 37L15 37L15 38L16 38L16 39L18 39L18 38L19 38L19 37L20 37L20 36L22 36L22 35L23 35L23 36L24 36L24 35L25 35L25 38L27 38L27 36L28 36L28 38L29 38L29 39L30 39L30 40L28 40L28 39L26 39L26 40L27 40L27 41L28 41L28 42L27 42L27 44L28 44L28 43L29 43L29 41L31 41L31 42L30 42L30 43L31 43L31 42L32 42L32 41L33 41L33 42L35 42L35 41L36 41L36 38L35 38L35 37L36 37L36 36L37 36L37 35L36 35L36 34L37 34L37 33L36 33L36 32L37 32L37 30L35 30L35 29L36 29L36 28L35 28L35 29L34 29L34 26L35 26L35 24L36 24L36 23L35 23L35 21L33 21L33 20L30 20L30 19L33 19L33 18L35 18L35 19L34 19L34 20L36 20L36 19L37 19L37 20L39 20L39 19L42 19L42 18L40 18L40 17L41 17L41 16L40 16L40 15L39 15L39 17L38 17L38 16L35 16L35 17L34 17L34 16L32 16L32 15L34 15L34 14L35 14L35 12L36 12L36 13L37 13L37 12L36 12L36 11L33 11L33 12L30 12L30 11L31 11L31 10L28 10L28 11L25 11L25 12L24 12L24 14L21 14L21 15L20 15L20 13L21 13L21 11L17 11L17 13L16 13L16 11L15 11L15 10L16 10L16 9L18 9L18 10L23 10L23 11L22 11L22 12L23 12L23 11L24 11L24 10L27 10L27 8L28 8L28 9L29 9L29 8L28 8L28 6L29 6L29 7L30 7L30 9L31 9L31 8L32 8L32 9L33 9L33 10L35 10L35 9L34 9L34 8L32 8L32 6L33 6L33 7L34 7L34 6L33 6L33 5L32 5L32 6L31 6L31 5L30 5L30 4L29 4L29 3L27 3L27 2L26 2L26 1ZM21 3L21 4L22 4L22 3ZM26 3L26 4L27 4L27 5L28 5L28 4L27 4L27 3ZM17 5L17 6L16 6L16 7L17 7L17 6L18 6L18 7L19 7L19 5ZM21 5L21 8L24 8L24 5ZM29 5L29 6L30 6L30 7L31 7L31 6L30 6L30 5ZM12 6L12 7L13 7L13 6ZM22 6L22 7L23 7L23 6ZM18 8L18 9L19 9L19 8ZM41 9L41 10L42 10L42 11L43 11L43 10L42 10L42 9ZM6 10L6 11L3 11L3 12L4 12L4 13L3 13L3 14L4 14L4 13L5 13L5 12L6 12L6 13L8 13L8 14L9 14L9 13L8 13L8 12L6 12L6 11L7 11L7 10ZM28 11L28 12L27 12L27 13L28 13L28 12L29 12L29 11ZM18 12L18 13L17 13L17 14L16 14L16 13L14 13L14 14L15 14L15 15L17 15L17 16L18 16L18 17L17 17L17 18L18 18L18 21L20 21L20 25L19 25L19 24L18 24L18 26L17 26L17 25L16 25L16 26L15 26L15 27L16 27L16 28L15 28L15 29L17 29L17 30L16 30L16 31L15 31L15 32L16 32L16 31L18 31L18 29L19 29L19 30L23 30L23 29L24 29L24 30L25 30L25 31L23 31L23 33L22 33L22 31L19 31L19 32L20 32L20 33L18 33L18 32L17 32L17 33L18 33L18 37L17 37L17 36L16 36L16 35L15 35L15 37L17 37L17 38L18 38L18 37L19 37L19 36L20 36L20 35L19 35L19 34L20 34L20 33L22 33L22 34L21 34L21 35L22 35L22 34L23 34L23 35L24 35L24 34L26 34L26 36L27 36L27 35L28 35L28 36L29 36L29 38L31 38L31 39L32 39L32 40L31 40L31 41L32 41L32 40L35 40L35 38L32 38L32 37L31 37L31 36L36 36L36 35L35 35L35 34L33 34L33 33L34 33L34 32L33 32L33 31L35 31L35 30L32 30L32 32L33 32L33 33L31 33L31 31L28 31L28 30L25 30L25 29L26 29L26 28L27 28L27 29L28 29L28 28L29 28L29 29L30 29L30 30L31 30L31 28L33 28L33 25L32 25L32 24L33 24L33 23L32 23L32 24L31 24L31 23L30 23L30 22L31 22L31 21L30 21L30 20L29 20L29 19L30 19L30 18L33 18L33 17L32 17L32 16L31 16L31 15L29 15L29 14L31 14L31 13L29 13L29 14L28 14L28 16L27 16L27 18L26 18L26 15L27 15L27 14L24 14L24 16L25 16L25 18L24 18L24 19L25 19L25 18L26 18L26 19L27 19L27 20L26 20L26 21L27 21L27 22L26 22L26 23L25 23L25 20L22 20L22 19L21 19L21 17L20 17L20 15L19 15L19 14L18 14L18 13L19 13L19 12ZM25 12L25 13L26 13L26 12ZM38 12L38 14L41 14L41 15L42 15L42 13L43 13L43 12L42 12L42 13L41 13L41 12ZM10 13L10 14L12 14L12 13ZM17 14L17 15L18 15L18 14ZM12 15L12 16L11 16L11 17L9 17L9 18L11 18L11 19L10 19L10 20L12 20L12 18L14 18L14 17L13 17L13 16L14 16L14 15ZM21 15L21 16L22 16L22 18L23 18L23 16L22 16L22 15ZM28 16L28 18L27 18L27 19L29 19L29 16ZM42 16L42 17L43 17L43 16ZM15 17L15 18L16 18L16 17ZM18 17L18 18L19 18L19 17ZM35 17L35 18L37 18L37 19L39 19L39 18L38 18L38 17ZM19 19L19 20L21 20L21 19ZM28 20L28 22L30 22L30 21L29 21L29 20ZM41 20L41 22L42 22L42 23L41 23L41 24L42 24L42 23L43 23L43 22L44 22L44 21L43 21L43 20ZM5 21L5 24L8 24L8 21ZM21 21L21 24L24 24L24 21ZM37 21L37 24L40 24L40 21ZM42 21L42 22L43 22L43 21ZM6 22L6 23L7 23L7 22ZM17 22L17 23L19 23L19 22ZM22 22L22 23L23 23L23 22ZM38 22L38 23L39 23L39 22ZM12 23L12 24L14 24L14 23ZM26 23L26 25L25 25L25 26L24 26L24 27L23 27L23 26L22 26L22 25L20 25L20 26L18 26L18 27L20 27L20 28L19 28L19 29L23 29L23 28L24 28L24 27L25 27L25 26L27 26L27 28L28 28L28 25L31 25L31 26L29 26L29 28L31 28L31 26L32 26L32 25L31 25L31 24L28 24L28 23ZM27 24L27 25L28 25L28 24ZM8 26L8 27L9 27L9 26ZM20 26L20 27L21 27L21 26ZM41 26L41 27L42 27L42 26ZM22 27L22 28L23 28L23 27ZM4 28L4 29L3 29L3 31L4 31L4 30L6 30L6 31L7 31L7 30L8 30L8 28L6 28L6 29L5 29L5 28ZM17 28L17 29L18 29L18 28ZM6 29L6 30L7 30L7 29ZM40 30L40 31L41 31L41 30ZM13 31L13 32L12 32L12 33L11 33L11 34L12 34L12 33L13 33L13 36L14 36L14 33L13 33L13 32L14 32L14 31ZM26 31L26 32L27 32L27 31ZM28 32L28 33L26 33L26 34L28 34L28 35L30 35L30 36L31 36L31 34L28 34L28 33L29 33L29 32ZM15 33L15 34L16 34L16 33ZM40 33L40 34L38 34L38 35L40 35L40 36L41 36L41 35L40 35L40 34L41 34L41 33ZM43 33L43 34L44 34L44 33ZM4 34L4 35L1 35L1 36L0 36L0 37L1 37L1 36L3 36L3 37L5 37L5 34ZM8 34L8 35L9 35L9 34ZM32 34L32 35L33 35L33 34ZM43 35L43 36L42 36L42 39L43 39L43 37L44 37L44 35ZM21 37L21 40L24 40L24 37ZM37 37L37 40L40 40L40 37ZM22 38L22 39L23 39L23 38ZM38 38L38 39L39 39L39 38ZM12 39L12 40L14 40L14 39ZM19 39L19 42L20 42L20 39ZM16 40L16 41L13 41L13 42L16 42L16 41L18 41L18 40ZM9 41L9 43L10 43L10 42L12 42L12 41ZM22 41L22 42L23 42L23 41ZM44 42L44 43L45 43L45 42ZM40 43L40 45L42 45L42 44L43 44L43 45L44 45L44 44L43 44L43 43ZM22 44L22 45L25 45L25 44ZM0 0L0 7L7 7L7 0ZM1 1L1 6L6 6L6 1ZM2 2L2 5L5 5L5 2ZM38 0L38 7L45 7L45 0ZM39 1L39 6L44 6L44 1ZM40 2L40 5L43 5L43 2ZM0 38L0 45L7 45L7 38ZM1 39L1 44L6 44L6 39ZM2 40L2 43L5 43L5 40Z" fill="#000000"></path></g></g></svg>
</div>
            <div><a class="basic_link" href="javascript:navigator.clipboard.writeText('https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers?import_user_id=800792c9-f818-4f12-88ef-097c66a82f16');alert('The link has been copied to your clipboard.');">Copy Link</a></div>
        </div>

                    <div class="mt-1">
                <div class="p-2 font-bold text-md text-usa-blue border-usa-blue border-b-2">Teams</div>
                <div class="mt-2 grid grid-cols-1 md:grid-cols-2 md:gap-1 lg:grid-cols-3">
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;team&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventTeam&quot;,&quot;key&quot;:&quot;b39b3462-ccb5-41b0-adac-e3c4b1bef33e&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;show_duals&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;YgXqZi8LMTrmGJOZeZru&quot;,&quot;name&quot;:&quot;my-team&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;7494a60b4aec32d095934429dc74d1a2ff05472a9c04d4f8deec4e119903937a&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleDuals&quot;,&quot;refresh&quot;]}" wire:id="YgXqZi8LMTrmGJOZeZru" class="mb-2" style="font-size:1.2em;">
    <div style="text-align:left;" class="p-2 bg-gray-200 font-bold  border-b border-usa-blue flex">
        The Fort Hammers, IN
    </div>
    <ul role="list" class="space-y-6 pr-2 mt-2 mb-6">
                                </ul>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                    </div>
            </div>
                            <div class="mt-1">
                <div class="p-2 font-bold text-md text-usa-blue border-usa-blue border-b-2">Wrestlers</div>
                <div class="mt-2 grid grid-cols-1 md:grid-cols-2 md:gap-1 lg:grid-cols-3">
                                                                <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="SMSFGS8xwoDhmAaAJeV2" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a>
                         (Warrior RTC, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '372430b3-7fb3-472c-80a0-2aa0ed2cab6d'})">
                                                High School - 129 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/372430b3-7fb3-472c-80a0-2aa0ed2cab6d/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/372430b3-7fb3-472c-80a0-2aa0ed2cab6d" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/f102385e-33ac-4620-9ec3-564e6cca5027" target="_blank">
                                                    4 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('10947cd5-c1d9-4ec7-97bd-8583c0b8b993')" class="font-bold text-usa-blue cursor-pointer">Mat 2</a> -
                                                                                                                                                Bout 3011 - Champ. Rd of 128: <span class="my-76e2063f-b923-4264-8327-db66bde1e303"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/3e0ffe1d-d3db-4794-baf4-b1f216d039e6">Gavin Reed</a></span>, MHS over <span class="my-f102385e-33ac-4620-9ec3-564e6cca5027"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a></span>, WART (<a style="color:blue;" href="javascript:fetchScoreSummary('d01c4f14-ce9d-4856-b3b3-cb1b0993dfc7')">Dec 2-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/_ehhDG_eWtE"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Cons. Sub-Rd of 64: <span class="my-f102385e-33ac-4620-9ec3-564e6cca5027"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a></span>, WART over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('7c38f49a-f83c-48ea-87df-0bad56ae37a7')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('3bf0006f-6da2-49b3-adda-dfaf5a7994de')" class="font-bold text-usa-blue cursor-pointer">Mat 9</a> -
                                                                                                                                                Bout 3115 - Cons. Rd of 64: <span class="my-f102385e-33ac-4620-9ec3-564e6cca5027"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a></span>, WART over <span class="my-a6debd42-e586-46bf-808e-ce9a9c0dd835"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/adc8c4b4-0525-494b-ac72-8c62ead13339">Ty Whitten</a></span>, MCWC (<a style="color:blue;" href="javascript:fetchScoreSummary('8557abae-eae0-4095-b515-10a941848cc3')">Dec 9-6 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://classofx.com/networks/content/95012165-e11c-4064-b942-f789d19adbd5/view"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('2bcb21d6-343b-4811-a9dd-02f583d7c845')" class="font-bold text-usa-blue cursor-pointer">Mat 11</a> -
                                                                                                                                                Bout 3148 - Cons. Sub-Rd of 32: <span class="my-f102385e-33ac-4620-9ec3-564e6cca5027"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a></span>, WART over <span class="my-0e8146b9-9b56-4583-b7db-f8b38c84e95b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/105998c3-e4f7-416f-938a-35c16a9b5fb3">Jaxson Kaufman</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('f462ce31-63e8-4c6e-b084-b8f2bfe19851')">F 3:37 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://classofx.com/networks/content/7e02be3e-46ab-4b97-a678-6059e6e3dcd8/view"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('3bf0006f-6da2-49b3-adda-dfaf5a7994de')" class="font-bold text-usa-blue cursor-pointer">Mat 9</a> -
                                                                                                                                                Bout 3220 - Cons. Rd of 32: <span class="my-f00c96c6-9434-4c86-ad62-61643eda4e39"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/493e3b61-bb70-499a-919a-195da233cd14">Edward Vitu</a></span>, SFD over <span class="my-f102385e-33ac-4620-9ec3-564e6cca5027"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a></span>, WART (<a style="color:blue;" href="javascript:fetchScoreSummary('95cfeb8f-e329-4d17-9065-41bd04b9db33')">Dec 3-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://classofx.com/networks/content/f4b3aec3-df7f-4ba4-a96f-5f5c9f6ffe88/view"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="a2pWnS1m2o78FJzcgRm9" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/421c0993-ea76-4c9b-a5f9-cd65a8567848">Konnor Cleveland</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '14c82e87-fc3a-495d-beee-89cb1ecf6cd0'})">
                                                High School - 109 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/14c82e87-fc3a-495d-beee-89cb1ecf6cd0/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/14c82e87-fc3a-495d-beee-89cb1ecf6cd0" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/44bbf73b-0834-42c8-8cdc-d9d8ae6398d0" target="_blank">
                                                    2.5 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 128: <span class="my-44bbf73b-0834-42c8-8cdc-d9d8ae6398d0"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/421c0993-ea76-4c9b-a5f9-cd65a8567848">Konnor Cleveland</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('7e01b2c7-7d21-4a17-b638-6d94d27377bf')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('3bf0006f-6da2-49b3-adda-dfaf5a7994de')" class="font-bold text-usa-blue cursor-pointer">Mat 9</a> -
                                                                                                                                                Bout 48 - Champ. Rd of 64: <span class="my-5c1e6ac7-1bc2-482a-9a06-4c0dcdbdf5fb"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4dcfa8d1-82ad-437c-8a8e-f5299a2cab8f">Talon Sanderlyn</a></span>, CKWA over <span class="my-44bbf73b-0834-42c8-8cdc-d9d8ae6398d0"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/421c0993-ea76-4c9b-a5f9-cd65a8567848">Konnor Cleveland</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('43b8a2c8-f3d0-4fc7-b9d8-c5ecf418978c')">TF 18-1 (4:03)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Cons. Rd of 64: <span class="my-44bbf73b-0834-42c8-8cdc-d9d8ae6398d0"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/421c0993-ea76-4c9b-a5f9-cd65a8567848">Konnor Cleveland</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('b768d0d1-8a6f-489f-9bdf-7e51fe0baa3e')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('35453ad5-84af-403d-bcd9-09a658e32d00')" class="font-bold text-usa-blue cursor-pointer">Mat 6</a> -
                                                                                                                                                Bout 152 - Cons. Sub-Rd of 32: <span class="my-44bbf73b-0834-42c8-8cdc-d9d8ae6398d0"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/421c0993-ea76-4c9b-a5f9-cd65a8567848">Konnor Cleveland</a></span>, TFH over <span class="my-c7dcd748-6fb6-4d8b-9c4a-2f5143138c19"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/a477a523-56bc-4bf2-ad79-b2b9f8d3b1d5">Kley Beer</a></span>, WART (<a style="color:blue;" href="javascript:fetchScoreSummary('6cd5630f-502a-4082-a2d6-3d87d27c7c5d')">TF 16-0 (3:23)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('3bf0006f-6da2-49b3-adda-dfaf5a7994de')" class="font-bold text-usa-blue cursor-pointer">Mat 9</a> -
                                                                                                                                                Bout 216 - Cons. Rd of 32: <span class="my-3db48364-8909-44c4-a894-8b448589bf4c"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/210a9997-9dcf-49cb-ba5a-d94d978ab325">Noah Goelz</a></span>, AVON over <span class="my-44bbf73b-0834-42c8-8cdc-d9d8ae6398d0"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/421c0993-ea76-4c9b-a5f9-cd65a8567848">Konnor Cleveland</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('ef1b593f-c279-4703-a131-83811a0ef906')">MD 12-0</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="4eayDyvIYhyPu8qxJqo6" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/02d0297f-f65e-47b7-ab75-20c7b25e3521">Jaden Cochran</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '51451c69-9fa8-4061-b0d4-deec08b941f7'})">
                                                High School - 193 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/51451c69-9fa8-4061-b0d4-deec08b941f7/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/51451c69-9fa8-4061-b0d4-deec08b941f7" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/00c9d091-333b-4278-b295-9f6feec69caa" target="_blank">
                                                    0 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('2bcb21d6-343b-4811-a9dd-02f583d7c845')" class="font-bold text-usa-blue cursor-pointer">Mat 11</a> -
                                                                                                                                                Bout 1002 - Champ. Rd of 32: <span class="my-ac250467-9cee-453c-b94d-36afcefa4369"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/c40a082d-ac7d-40fc-8e20-16f72d22d1d0">Caleb Ayetomowo</a></span>, INDI over <span class="my-00c9d091-333b-4278-b295-9f6feec69caa"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/02d0297f-f65e-47b7-ab75-20c7b25e3521">Jaden Cochran</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('561fc6c4-cf06-4945-a721-d4a371fa5af7')">TF 16-0 (4:51)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('c7e1dd50-a2cb-4989-9e74-0daf35ad0a00')" class="font-bold text-usa-blue cursor-pointer">Mat 1</a> -
                                                                                                                                                Bout 1023 - Cons. Sub-Rd of 16: <span class="my-1897b000-8fa5-4c0a-b97b-acc874178ba6"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/54c48dc7-326b-41e2-89e9-43e5bd1d1426">Garrison Messer</a></span>, OHCO over <span class="my-00c9d091-333b-4278-b295-9f6feec69caa"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/02d0297f-f65e-47b7-ab75-20c7b25e3521">Jaden Cochran</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('0e88785a-6dde-40a0-86cb-ab34a9451ecc')">MD 13-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/IQvPOxwJd4o"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="51YCXOwIqLrAjkdjOINj" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '5aaaf7cc-87ee-4b3f-8157-d91624cd7b77'})">
                                                High School - 141 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/5aaaf7cc-87ee-4b3f-8157-d91624cd7b77/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/5aaaf7cc-87ee-4b3f-8157-d91624cd7b77" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/4045e013-504e-4f89-98c0-eea699e1a3c9" target="_blank">
                                                    9 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 128: <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('1a3ae3ec-8d5b-4ed0-9c76-086e6c978971')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b374656c-a263-4451-967f-212d25df8783')" class="font-bold text-usa-blue cursor-pointer">Mat 14</a> -
                                                                                                                                                Bout 2039 - Champ. Rd of 64: <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH over <span class="my-6eebcd60-912e-42cc-a6ce-a2f228c4e951"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/aaa6483d-7254-4549-b3af-5f7c5cc19d2f">Braxton Shines</a></span>, SBWC (<a style="color:blue;" href="javascript:fetchScoreSummary('9c6f4d70-e911-43e6-a834-7d7f69e24bb1')">TF 22-4 (2:59)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('2bcb21d6-343b-4811-a9dd-02f583d7c845')" class="font-bold text-usa-blue cursor-pointer">Mat 11</a> -
                                                                                                                                                Bout 2095 - Champ. Rd of 32: <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH over <span class="my-8472e1ca-287c-46ea-9616-69eb2f12536e"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4d56a13b-1b54-4e93-a14f-0be1f215b417">Aslan Templeton</a></span>, MCWC (<a style="color:blue;" href="javascript:fetchScoreSummary('99b08473-dcb1-4864-a6aa-11647116f16a')">TF 21-4 (2:47)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b374656c-a263-4451-967f-212d25df8783')" class="font-bold text-usa-blue cursor-pointer">Mat 14</a> -
                                                                                                                                                Bout 2174 - Champ. Rd of 16: <span class="my-7437d76b-5495-46bc-aa7a-4c1d6757129f"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/5a5b46a4-ba67-4c30-a7eb-a198a29c62d7">Joseph Lugabihl</a></span>, TOMA over <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('dfc738bc-a8da-4c4a-bab1-7e9bf6c42b8c')">Dec 5-4</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b2de0ee0-2d05-4e8e-a36d-629746f6bce8')" class="font-bold text-usa-blue cursor-pointer">Mat 16</a> -
                                                                                                                                                Bout 2202 - Cons. Rd of 16: <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH over <span class="my-64414a06-b200-4206-bc70-e66946ba5ae9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/aca15133-f381-4d4d-89d2-48c7c0974f5c">Adante Washington</a></span>, HATW (<a style="color:blue;" href="javascript:fetchScoreSummary('53179636-e75b-417a-a07c-87a34ce923d4')">Dec 4-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/yjwUS2FLWvU"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('495dab43-f12c-4a07-bbe9-302c84870dc2')" class="font-bold text-usa-blue cursor-pointer">Mat 12</a> -
                                                                                                                                                Bout 2221 - Cons. Sub-Quarters: <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH over <span class="my-5d8f1e34-edfe-4db2-90e4-f9a7c26b2a7c"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/0627e7df-b838-4068-ab72-d76e53e7453e">Nick Vivian</a></span>, LASA (<a style="color:blue;" href="javascript:fetchScoreSummary('ac04a920-52e9-41c8-b3c6-ed9f14d0eaf7')">Dec 7-6</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('495dab43-f12c-4a07-bbe9-302c84870dc2')" class="font-bold text-usa-blue cursor-pointer">Mat 12</a> -
                                                                                                                                                Bout 2233 - Cons. Quarters: <span class="my-7fa4dcb9-feb4-431e-a3af-fdb0cb37a767"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/e7848305-00de-4e50-b2d5-1ce262fafe46">Donald Bowie</a></span>, WWA over <span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('8e72e4aa-915f-432c-b5cc-bb1b6dd3ab2b')">SV 4-1</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="dR5wmizQbUh6wT4WXqOr" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a>
                         (Garrett, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '56c0b5fa-351e-4604-86fa-7e3a47e000b2'})">
                                                High School - 178 - (1st)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/56c0b5fa-351e-4604-86fa-7e3a47e000b2/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/56c0b5fa-351e-4604-86fa-7e3a47e000b2" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5" target="_blank">
                                                    30.5 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 64: <span class="my-bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a></span>, GARR over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('8ce07e93-f20b-4b6b-ab0c-cda99c742e0c')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('c7e1dd50-a2cb-4989-9e74-0daf35ad0a00')" class="font-bold text-usa-blue cursor-pointer">Mat 1</a> -
                                                                                                                                                Bout 4015 - Champ. Rd of 32: <span class="my-bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a></span>, GARR over <span class="my-c951cc92-f2f9-4d08-8dcc-1512b4c17040"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/2972d523-7334-4806-8f14-d8dd5d0d1075">Keegen Andrews</a></span>, MARY (<a style="color:blue;" href="javascript:fetchScoreSummary('6743ac3b-9694-48eb-8aad-92875d69e8e9')">F 2:47 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/1dp7cWkkXsw"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('2bcb21d6-343b-4811-a9dd-02f583d7c845')" class="font-bold text-usa-blue cursor-pointer">Mat 11</a> -
                                                                                                                                                Bout 4054 - Champ. Rd of 16: <span class="my-bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a></span>, GARR over <span class="my-255bce90-ff99-4744-a916-21fe4cf18db4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/9ef22226-5096-46d1-93df-f214eb45a492">Wesaal Wardak</a></span>, MUNS (<a style="color:blue;" href="javascript:fetchScoreSummary('9003c544-7aec-4e49-b06e-2e1f6f84c9dc')">MD 13-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://classofx.com/networks/content/b87facb0-ca8c-4d60-994d-e4e0278e3e8f/view"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('2bcb21d6-343b-4811-a9dd-02f583d7c845')" class="font-bold text-usa-blue cursor-pointer">Mat 11</a> -
                                                                                                                                                Bout 4086 - Quarters: <span class="my-bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a></span>, GARR over <span class="my-debf2d31-1821-4a63-96dd-1bf1b064fe2e"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/43cee9c6-e8f3-47ef-a656-7ea8f887d12d">Tyson Barrow</a></span>, MCWC (<a style="color:blue;" href="javascript:fetchScoreSummary('4ff28a5d-427d-4ee7-8f48-b17eeb95cc1f')">TF 17-0 (3:23)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('c7e1dd50-a2cb-4989-9e74-0daf35ad0a00')" class="font-bold text-usa-blue cursor-pointer">Mat 1</a> -
                                                                                                                                                Bout 4102 - Semis: <span class="my-bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a></span>, GARR over <span class="my-7305f5da-cd47-4b93-b999-a1e7bf50eee4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/63431ea5-5c22-4954-9fb9-1c90851b8145">Ben Hall</a></span>, MARI (<a style="color:blue;" href="javascript:fetchScoreSummary('1e6eafe5-bdae-4ad8-875f-6fb41731e7d0')">MD 14-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/1fw3SZuZa94"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('c7e1dd50-a2cb-4989-9e74-0daf35ad0a00')" class="font-bold text-usa-blue cursor-pointer">Mat 1</a> -
                                                                                                                                                Bout 4115 - 1st Place Match: <span class="my-bab7d71e-fcb4-4ebc-b14c-b2227c85e5c5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f447b5d7-e9a4-483c-89d7-afc334506d6e">Carter Fielden</a></span>, GARR over <span class="my-a546efc7-8f8f-4f16-a534-b1c7f19f01fe"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f0b1defe-e830-4596-b37b-9230d01c2534">Zach Miracle</a></span>, BEDF (<a style="color:blue;" href="javascript:fetchScoreSummary('17cc69fd-0d87-451a-8637-07884c1f81de')">MD 15-4 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://www.youtube.com/watch?v=sL3D1B9ZVOY"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="ZfWQKMrWQAj7r0tgxN3K" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/9582c010-aa7e-415a-9e1f-78da083a43e0">Charlie Fleshman</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'e208c71d-94b6-47d7-a496-6e94ba4bcb00'})">
                                                High School - 123 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/e208c71d-94b6-47d7-a496-6e94ba4bcb00/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/e208c71d-94b6-47d7-a496-6e94ba4bcb00" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/4487fe6a-0230-4e62-950c-1f5301c20f0a" target="_blank">
                                                    4.5 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b573f5d0-3d09-4fa6-886e-396486901d4b')" class="font-bold text-usa-blue cursor-pointer">Mat 3</a> -
                                                                                                                                                Bout 26 - Champ. Rd of 128: <span class="my-6ea38009-528b-47c1-9818-c2242331ff0a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/edd7a3a7-e6ed-42db-aaf9-818e65483b5d">Mykola Shamray</a></span>, BBB over <span class="my-4487fe6a-0230-4e62-950c-1f5301c20f0a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/9582c010-aa7e-415a-9e1f-78da083a43e0">Charlie Fleshman</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('b7eb7089-faa7-470a-a78d-b003faa5246e')">TF 16-1 (3:38) </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/PEif8VaWsV8"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Cons. Sub-Rd of 64: <span class="my-4487fe6a-0230-4e62-950c-1f5301c20f0a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/9582c010-aa7e-415a-9e1f-78da083a43e0">Charlie Fleshman</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('80cdaed5-2fdd-4580-a288-a86be0fbea1a')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('4918d08d-23da-47d8-a76a-1c0aebd15d31')" class="font-bold text-usa-blue cursor-pointer">Mat 8</a> -
                                                                                                                                                Bout 129 - Cons. Rd of 64: <span class="my-4487fe6a-0230-4e62-950c-1f5301c20f0a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/9582c010-aa7e-415a-9e1f-78da083a43e0">Charlie Fleshman</a></span>, TFH over <span class="my-e4564a8c-1dc3-4d82-aa0d-ac442989bf8b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/26fc850a-4049-4c10-bdc9-75c6dfae4e13">Skyler Eads</a></span>, WHIT (<a style="color:blue;" href="javascript:fetchScoreSummary('e4b453b7-a413-4769-8273-be5fd40759ac')">TF 18-2 (2:58) </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/2WTvmFLx4Sw"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('3bf0006f-6da2-49b3-adda-dfaf5a7994de')" class="font-bold text-usa-blue cursor-pointer">Mat 9</a> -
                                                                                                                                                Bout 193 - Cons. Sub-Rd of 32: <span class="my-4487fe6a-0230-4e62-950c-1f5301c20f0a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/9582c010-aa7e-415a-9e1f-78da083a43e0">Charlie Fleshman</a></span>, TFH over <span class="my-ac5bbf73-0ca2-4af6-8d05-1ae920ad9b36"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/37267b96-c581-4c47-816e-d8f68e7c012b">Jackson DiSabato</a></span>, SFD (<a style="color:blue;" href="javascript:fetchScoreSummary('d509cb09-c7ff-40a7-8dcc-2da38103dc27')">MD 15-3</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('03fe1fee-8c80-44c0-aff1-dfa82c22f649')" class="font-bold text-usa-blue cursor-pointer">Mat 4</a> -
                                                                                                                                                Bout 241 - Cons. Rd of 32: <span class="my-4d42609d-a250-45b0-90b1-fcc9810024e8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/6d809b06-a811-489c-99ac-6a92fa694e16">Will Hruskoci</a></span>, FWC over <span class="my-4487fe6a-0230-4e62-950c-1f5301c20f0a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/9582c010-aa7e-415a-9e1f-78da083a43e0">Charlie Fleshman</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('64e1dea9-a45f-451d-8ed2-6ff0a16e76d6')">F 0:32 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/H3PMJlpkD7o"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="JA4a04AidGBYUVbutMmX" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/4f35e9af-d722-4fb6-84f0-725761e63b1d">Drew Heisler</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '11e31b79-a499-46bc-8d27-570e05eef152'})">
                                                High School - 116 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/11e31b79-a499-46bc-8d27-570e05eef152/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/11e31b79-a499-46bc-8d27-570e05eef152" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/4a344d91-4665-47db-8be6-44ad9e47820d" target="_blank">
                                                    8.5 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('ac8365f3-4b80-473a-bf31-53a7f693cb49')" class="font-bold text-usa-blue cursor-pointer">Mat 13</a> -
                                                                                                                                                Bout 5054 - Champ. Rd of 64: <span class="my-4a344d91-4665-47db-8be6-44ad9e47820d"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4f35e9af-d722-4fb6-84f0-725761e63b1d">Drew Heisler</a></span>, TFH over <span class="my-b3ace1cf-fe14-4e59-a767-ced3eff4e061"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/f780556a-a6be-4c2f-b5fc-1ed7c3c4dd62">Jace Kimling</a></span>, HUDS (<a style="color:blue;" href="javascript:fetchScoreSummary('49de9c1d-f46b-4584-95c1-de3b58085312')">TF 15-0 (3:01)</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('29584cfd-fa30-4fb4-87cf-327aef20b848')" class="font-bold text-usa-blue cursor-pointer">Mat 17</a> -
                                                                                                                                                Bout 5142 - Champ. Rd of 32: <span class="my-4a344d91-4665-47db-8be6-44ad9e47820d"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4f35e9af-d722-4fb6-84f0-725761e63b1d">Drew Heisler</a></span>, TFH over <span class="my-e3b4235e-dac0-41ca-9dab-3a6387d49424"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/2ad9de53-3015-484a-a301-005db24c78fc">Ramon Sierra</a></span>, GARR (<a style="color:blue;" href="javascript:fetchScoreSummary('6ec267ee-ddcc-44de-b9f6-aaf5c7dfe782')">F 0:41 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/sEGqOPJJ0bM"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('8a4d4413-cfef-475a-a250-55c627c00d31')" class="font-bold text-usa-blue cursor-pointer">Mat 15</a> -
                                                                                                                                                Bout 5217 - Champ. Rd of 16: <span class="my-5a26fef8-9220-44df-85c9-1fdac21b7ea3"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/8b1325b1-cd29-4a09-ae2c-4287dc452257">Daniel Brown Jr.</a></span>, CGWC over <span class="my-4a344d91-4665-47db-8be6-44ad9e47820d"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4f35e9af-d722-4fb6-84f0-725761e63b1d">Drew Heisler</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('f7b11c3e-598b-4e70-b357-fde114493f0a')">MD 16-5</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('29584cfd-fa30-4fb4-87cf-327aef20b848')" class="font-bold text-usa-blue cursor-pointer">Mat 17</a> -
                                                                                                                                                Bout 5247 - Cons. Rd of 16: <span class="my-4a344d91-4665-47db-8be6-44ad9e47820d"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4f35e9af-d722-4fb6-84f0-725761e63b1d">Drew Heisler</a></span>, TFH over <span class="my-cf72f6b9-153d-4bc0-9c6a-305538302cea"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/cb1cf74a-9db7-4965-9e24-0f67ab3530d5">Carter Shegog</a></span>, AWC (<a style="color:blue;" href="javascript:fetchScoreSummary('f989c27a-eb79-4f0c-a4da-1a139610e8c5')">Dec 5-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/lpnj8ixzFu4"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b374656c-a263-4451-967f-212d25df8783')" class="font-bold text-usa-blue cursor-pointer">Mat 14</a> -
                                                                                                                                                Bout 5264 - Cons. Sub-Quarters: <span class="my-4c782b11-0079-46a5-a286-1655b9b83f33"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/53e3d152-7fca-48d3-a659-93b156534cb4">DeMarco Kates</a></span>, COLE over <span class="my-4a344d91-4665-47db-8be6-44ad9e47820d"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4f35e9af-d722-4fb6-84f0-725761e63b1d">Drew Heisler</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('4e2fff09-9cdd-4214-a179-84f4899c7f02')">F 0:32</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="d7ygais5bF7ssLxT3AWk" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/45381f91-9aad-494e-9903-d92806610a70">Grant Howard</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '56c0b5fa-351e-4604-86fa-7e3a47e000b2'})">
                                                High School - 178 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/56c0b5fa-351e-4604-86fa-7e3a47e000b2/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/56c0b5fa-351e-4604-86fa-7e3a47e000b2" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/08514f29-c64d-4ab4-9b0c-d8ca6ffd108a" target="_blank">
                                                    0 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 64: <span class="my-08514f29-c64d-4ab4-9b0c-d8ca6ffd108a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/45381f91-9aad-494e-9903-d92806610a70">Grant Howard</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('cd6b5850-9b9d-4e25-8950-841c50a47b56')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('c7e1dd50-a2cb-4989-9e74-0daf35ad0a00')" class="font-bold text-usa-blue cursor-pointer">Mat 1</a> -
                                                                                                                                                Bout 4017 - Champ. Rd of 32: <span class="my-2ea8bd59-0ad9-4995-8662-d6861ae7958b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/479c7fcc-c9e4-44eb-9a4f-cbd3b957dbcb">Aiden Granger</a></span>, HOBA over <span class="my-08514f29-c64d-4ab4-9b0c-d8ca6ffd108a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/45381f91-9aad-494e-9903-d92806610a70">Grant Howard</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('210fe8d8-abd9-4b16-aab9-e0cd162cd000')">Dec 8-5 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/cM1PQGzoHq0"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('c7e1dd50-a2cb-4989-9e74-0daf35ad0a00')" class="font-bold text-usa-blue cursor-pointer">Mat 1</a> -
                                                                                                                                                Bout 4047 - Cons. Rd of 32: <span class="my-cccd5f9e-74ef-4946-b30b-74e70fe03b16"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/7675cf39-57ff-4ce1-88f6-c6246d626f4a">Jackson Burgin</a></span>, GWC over <span class="my-08514f29-c64d-4ab4-9b0c-d8ca6ffd108a"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/45381f91-9aad-494e-9903-d92806610a70">Grant Howard</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('ca3cef80-e844-44a2-9510-6d4340cfbed7')">Dec 5-0 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/GBweiRpzhg4"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="34eDY59Hslr8Lf6IFGTq" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/b72acf0e-0bba-4613-b760-f20bb07c1639">Ian Hutchinson</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'c3b27b67-e029-46f7-a54e-253423d84942'})">
                                                High School - 153 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/c3b27b67-e029-46f7-a54e-253423d84942/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/c3b27b67-e029-46f7-a54e-253423d84942" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/3644e07e-0fa3-42a9-abd2-ad9c950539c4" target="_blank">
                                                    2.5 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 128: <span class="my-3644e07e-0fa3-42a9-abd2-ad9c950539c4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/b72acf0e-0bba-4613-b760-f20bb07c1639">Ian Hutchinson</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('4cea4c28-43c3-4eba-ac64-aac628b9a8de')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('4918d08d-23da-47d8-a76a-1c0aebd15d31')" class="font-bold text-usa-blue cursor-pointer">Mat 8</a> -
                                                                                                                                                Bout 3052 - Champ. Rd of 64: <span class="my-63eb002a-6383-4fa6-8e61-1738cab03fc3"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/fa82ad18-2869-4f33-a1bc-40163f8aefef">Jack Strezo</a></span>, VIEL over <span class="my-3644e07e-0fa3-42a9-abd2-ad9c950539c4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/b72acf0e-0bba-4613-b760-f20bb07c1639">Ian Hutchinson</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('34f404a9-1bb2-4685-b917-ccaa6b02a77e')">MD 9-1 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/Hhy_MeWl_B8"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Cons. Rd of 64: <span class="my-3644e07e-0fa3-42a9-abd2-ad9c950539c4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/b72acf0e-0bba-4613-b760-f20bb07c1639">Ian Hutchinson</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('0a50f724-ea0a-44f7-9a8b-0ea95f5923e4')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('03fe1fee-8c80-44c0-aff1-dfa82c22f649')" class="font-bold text-usa-blue cursor-pointer">Mat 4</a> -
                                                                                                                                                Bout 3181 - Cons. Sub-Rd of 32: <span class="my-3644e07e-0fa3-42a9-abd2-ad9c950539c4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/b72acf0e-0bba-4613-b760-f20bb07c1639">Ian Hutchinson</a></span>, TFH over <span class="my-5213d889-7207-4f0f-88b5-ee07518efc23"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/ba6beb06-00ef-4dd5-ae78-07e0eebfba1a">Gabe Bousman</a></span>, YWC (<a style="color:blue;" href="javascript:fetchScoreSummary('437beee8-c34e-4523-a084-142c7ecccaa3')">TF 16-1 (2:46) </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/4W8tChpitvA"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('8435bf27-144b-431b-86c5-eb731c00d636')" class="font-bold text-usa-blue cursor-pointer">Mat 7</a> -
                                                                                                                                                Bout 3237 - Cons. Rd of 32: <span class="my-238f7c5d-743b-4bdf-8fdb-dd159acad424"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/047d5de7-1c1a-4e7f-9a3a-fe470a3edfee">Cashil Clark</a></span>, BEMO over <span class="my-3644e07e-0fa3-42a9-abd2-ad9c950539c4"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/b72acf0e-0bba-4613-b760-f20bb07c1639">Ian Hutchinson</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('a80bb05f-9ae7-4a5e-a0c2-617390153ec8')">Dec 8-7</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="dVRxKKqZsMDtnFQrd77K" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/4bbf3acb-be00-447e-b8a6-2a6ebcbe2ffe">Brayden Juday</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'e208c71d-94b6-47d7-a496-6e94ba4bcb00'})">
                                                High School - 123 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/e208c71d-94b6-47d7-a496-6e94ba4bcb00/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/e208c71d-94b6-47d7-a496-6e94ba4bcb00" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/178511a2-21fb-4c13-bda4-ef31b0510e75" target="_blank">
                                                    0 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 128: <span class="my-178511a2-21fb-4c13-bda4-ef31b0510e75"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4bbf3acb-be00-447e-b8a6-2a6ebcbe2ffe">Brayden Juday</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('2e99711f-e4ad-47ec-a00e-df6b5bfe081e')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('8435bf27-144b-431b-86c5-eb731c00d636')" class="font-bold text-usa-blue cursor-pointer">Mat 7</a> -
                                                                                                                                                Bout 71 - Champ. Rd of 64: <span class="my-ad4d9b17-1260-4fc4-800c-da2d7f1c89da"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/ca721a66-5475-4107-992e-39884e21891d">Nash Burke</a></span>, RWA over <span class="my-178511a2-21fb-4c13-bda4-ef31b0510e75"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4bbf3acb-be00-447e-b8a6-2a6ebcbe2ffe">Brayden Juday</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('0621898c-0e1c-4587-9397-71e1a03a4c51')">FF</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Cons. Rd of 64: <span class="my-178511a2-21fb-4c13-bda4-ef31b0510e75"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4bbf3acb-be00-447e-b8a6-2a6ebcbe2ffe">Brayden Juday</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('3d83458b-f5a6-414a-a7bd-c62b2bcb1c9d')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('35453ad5-84af-403d-bcd9-09a658e32d00')" class="font-bold text-usa-blue cursor-pointer">Mat 6</a> -
                                                                                                                                                Bout 189 - Cons. Sub-Rd of 32: <span class="my-480fddf3-f53b-4254-8451-0ee20298278e"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/6eb6f55c-51fd-4592-ab58-40a978258a1a">Colton Kimmel</a></span>, WATR over <span class="my-178511a2-21fb-4c13-bda4-ef31b0510e75"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4bbf3acb-be00-447e-b8a6-2a6ebcbe2ffe">Brayden Juday</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('4cbb95a0-abe9-40c3-9ec1-a82ca97544e5')">F 2:48</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="6jrmO43nx43K6LFd86bW" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/105998c3-e4f7-416f-938a-35c16a9b5fb3">Jaxson Kaufman</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '372430b3-7fb3-472c-80a0-2aa0ed2cab6d'})">
                                                High School - 129 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/372430b3-7fb3-472c-80a0-2aa0ed2cab6d/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/372430b3-7fb3-472c-80a0-2aa0ed2cab6d" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/0e8146b9-9b56-4583-b7db-f8b38c84e95b" target="_blank">
                                                    0 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Champ. Rd of 128: <span class="my-0e8146b9-9b56-4583-b7db-f8b38c84e95b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/105998c3-e4f7-416f-938a-35c16a9b5fb3">Jaxson Kaufman</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('29be87ef-b025-419d-bb36-292d68b2ae32')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('dde8447c-e695-4bbb-ab8e-938db2d61c41')" class="font-bold text-usa-blue cursor-pointer">Mat 5</a> -
                                                                                                                                                Bout 3022 - Champ. Rd of 64: <span class="my-4e1486cb-5c76-49cb-b455-28376908cb31"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/2875e762-ed59-423e-bc45-b1009c73720c">Bakari Cooper</a></span>, NEHA over <span class="my-0e8146b9-9b56-4583-b7db-f8b38c84e95b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/105998c3-e4f7-416f-938a-35c16a9b5fb3">Jaxson Kaufman</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('59287cc5-de8b-48d3-837d-7a891db00edf')">F 3:15</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                Bout  - Cons. Rd of 64: <span class="my-0e8146b9-9b56-4583-b7db-f8b38c84e95b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/105998c3-e4f7-416f-938a-35c16a9b5fb3">Jaxson Kaufman</a></span>, TFH over Bye (<a style="color:blue;" href="javascript:fetchScoreSummary('e6b2ead0-0a3b-4179-be8f-b6ac64bd99b1')">Bye</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('2bcb21d6-343b-4811-a9dd-02f583d7c845')" class="font-bold text-usa-blue cursor-pointer">Mat 11</a> -
                                                                                                                                                Bout 3148 - Cons. Sub-Rd of 32: <span class="my-f102385e-33ac-4620-9ec3-564e6cca5027"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/13494ffc-53f0-4fee-8a97-1c89f992fc9d">Braxtyn Bauer</a></span>, WART over <span class="my-0e8146b9-9b56-4583-b7db-f8b38c84e95b"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/105998c3-e4f7-416f-938a-35c16a9b5fb3">Jaxson Kaufman</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('f462ce31-63e8-4c6e-b084-b8f2bfe19851')">F 3:37 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://classofx.com/networks/content/7e02be3e-46ab-4b97-a678-6059e6e3dcd8/view"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:id="uiOpHOJWiExarjBm5tWr" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '4d7e1239-a1c8-40c6-8502-87cb15b4515f'})">
                                                High School - 147 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/4d7e1239-a1c8-40c6-8502-87cb15b4515f/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/4d7e1239-a1c8-40c6-8502-87cb15b4515f" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/856fb500-2b60-4546-8231-b51b121d60c8" target="_blank">
                                                    14 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                                    <ul class="divide-y divide-gray-200 text-sm text-gray-800">
                                                                                                                                                                                                                                                                <li class="py-2 px-2 bg-gray-300 font-bold text-gray-900">Completed</li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('ac8365f3-4b80-473a-bf31-53a7f693cb49')" class="font-bold text-usa-blue cursor-pointer">Mat 13</a> -
                                                                                                                                                Bout 2054 - Champ. Rd of 64: <span class="my-856fb500-2b60-4546-8231-b51b121d60c8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a></span>, TFH over <span class="my-810b251b-63f3-4637-b7ba-be77fb05f873"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/781508ad-5dc0-47f9-97d7-1d3cb029885b">George Hollendoner</a></span>, RWA (<a style="color:blue;" href="javascript:fetchScoreSummary('28bd1a94-bd67-4ff0-a0e7-0c06a955e923')">F 4:01</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b2de0ee0-2d05-4e8e-a36d-629746f6bce8')" class="font-bold text-usa-blue cursor-pointer">Mat 16</a> -
                                                                                                                                                Bout 2122 - Champ. Rd of 32: <span class="my-856fb500-2b60-4546-8231-b51b121d60c8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a></span>, TFH over <span class="my-3009a7f4-7cc0-478b-8b85-e500d6051811"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/97257055-9e32-407e-ba50-f1f8eb18348d">Bo Budzielek</a></span>, MEW (<a style="color:blue;" href="javascript:fetchScoreSummary('93d0b134-3921-47a7-a77b-bbf51b1b6cee')">F 0:54 </a><a style="position:relative;z-index:1001;" class="basic_link" target="_blank" href="https://youtu.be/m6vvEa1ZdNo"><i class="fa-regular fa-circle-play" aria-hidden="true"></i></a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('8a4d4413-cfef-475a-a250-55c627c00d31')" class="font-bold text-usa-blue cursor-pointer">Mat 15</a> -
                                                                                                                                                Bout 2186 - Champ. Rd of 16: <span class="my-0dccf198-ac99-4cbd-92f1-2147fe845cd5"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/04e043bc-f8e9-4f07-bdc2-fbf2bb09ef22">Lincoln Hinchman</a></span>, BROW over <span class="my-856fb500-2b60-4546-8231-b51b121d60c8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('0069d2b4-1ce3-47e5-97c4-9ba3a5fbf02b')">F 2:23</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('b374656c-a263-4451-967f-212d25df8783')" class="font-bold text-usa-blue cursor-pointer">Mat 14</a> -
                                                                                                                                                Bout 2208 - Cons. Rd of 16: <span class="my-856fb500-2b60-4546-8231-b51b121d60c8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a></span>, TFH over <span class="my-f58e59ff-5d11-43af-a57a-281960d67185"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/6f8604c7-3cf0-4d61-968e-d58d429e944b">Brian Thomas</a></span>, CHS (<a style="color:blue;" href="javascript:fetchScoreSummary('692cd6dd-2600-4a91-b98a-deaaee4ba9de')">F 2:55</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('495dab43-f12c-4a07-bbe9-302c84870dc2')" class="font-bold text-usa-blue cursor-pointer">Mat 12</a> -
                                                                                                                                                Bout 2228 - Cons. Sub-Quarters: <span class="my-856fb500-2b60-4546-8231-b51b121d60c8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a></span>, TFH over <span class="my-4ba311bf-133b-4b50-9693-482b3ab5c377"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/c9d539b4-33c9-436e-a8cc-4e98a7198a62">Blake Eckelbarger</a></span>, SFD (<a style="color:blue;" href="javascript:fetchScoreSummary('e10e7019-d5fc-4f03-9f0a-07dc869d4232')">F 3:27</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                    <li class="p-2">
                                                                    <span class=" text-black  ">
                                                                                                                                                    <a href="javascript:fetchUpcomingMatches('495dab43-f12c-4a07-bbe9-302c84870dc2')" class="font-bold text-usa-blue cursor-pointer">Mat 12</a> -
                                                                                                                                                Bout 2236 - Cons. Quarters: <span class="my-e565b741-000d-48ac-8ca7-e42570f0de44"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/94af3506-d164-490f-9938-e8b35eb09773">Cameron Plotts</a></span>, MPH over <span class="my-856fb500-2b60-4546-8231-b51b121d60c8"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/27ce7078-2dd1-4981-8c86-aff2ba7aec98">Ryan Kochendorfer</a></span>, TFH (<a style="color:blue;" href="javascript:fetchScoreSummary('b1702f00-f925-46e6-a3a6-6507a02b000a')">F 1:20</a>)
                                                                    </span>
                                                                                                                            </li>
                                                                                                                                                                                                            <!-- Refresh -->
                                                <div class="pt-4">
                                                    <button onclick="this.parentElement.parentElement.style.opacity=.4;" wire:click="$dispatchSelf('refresh')" class="text-sm text-usa-blue font-semibold hover:underline transition">
                                                        <i class="fa fa-refresh mr-1" aria-hidden="true"></i> Refresh
                                                    </button>
                                                </div>
                                            </ul>
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;5d88220a-0124-4bc5-86fe-f0072e984473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;5PE3fXsoo3bjJpaCZtIH&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;a6f649210157d62a427cfaad9a2b86c815372a2c5013cc6197041304eca99c07&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="5PE3fXsoo3bjJpaCZtIH" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/7c95e18b-b848-487b-9ad6-47e2d257a00d">Anthony Lopshire</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'c3b27b67-e029-46f7-a54e-253423d84942'})">
                                                High School - 153 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/c3b27b67-e029-46f7-a54e-253423d84942/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/c3b27b67-e029-46f7-a54e-253423d84942" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/5d88220a-0124-4bc5-86fe-f0072e984473" target="_blank">
                                                    11 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;3e9775ae-e707-4c1e-bc32-893f851f7277&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;hbfSVEsvCnplzgoRzIeU&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;c402f77cef7041b9d7b7bc3b6f8130650942bd8bf27ecf2d43ade32a1fcf272c&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="hbfSVEsvCnplzgoRzIeU" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/ebc5b1b2-0c0e-4e9e-a464-07caf2ed7b72">Bradyn Lothamer</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'fc854eaf-48ee-4e8a-9fdf-f9c02454b751'})">
                                                High School - 288 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/fc854eaf-48ee-4e8a-9fdf-f9c02454b751/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/fc854eaf-48ee-4e8a-9fdf-f9c02454b751" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/3e9775ae-e707-4c1e-bc32-893f851f7277" target="_blank">
                                                    9 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;8b271100-01de-47bf-89f5-bbaab202bfcf&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;bYfkdSLsc3G618lJeI65&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;685f7d4ea53c342ae3c9a4d65b92d0add2f80fa32ab291112b6ea3500de8f040&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="bYfkdSLsc3G618lJeI65" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/51b544fe-2afc-4cd8-a9a5-fffebfe7cb1b">Callen Olry</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '5aaaf7cc-87ee-4b3f-8157-d91624cd7b77'})">
                                                High School - 141 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/5aaaf7cc-87ee-4b3f-8157-d91624cd7b77/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/5aaaf7cc-87ee-4b3f-8157-d91624cd7b77" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/8b271100-01de-47bf-89f5-bbaab202bfcf" target="_blank">
                                                    6 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;9ea54743-dba2-4483-99f9-e2ac6fff6ff1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;byAra513bIX0d1E80IGe&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;e76d206103ed8891e385f72d4b429f3dc92aea3c1a9b0a208a2e4bcfc351e04d&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="byAra513bIX0d1E80IGe" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/30460543-48c2-4006-991e-91ec20db8988">Michael Smith</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'c3b27b67-e029-46f7-a54e-253423d84942'})">
                                                High School - 153 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/c3b27b67-e029-46f7-a54e-253423d84942/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/c3b27b67-e029-46f7-a54e-253423d84942" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/9ea54743-dba2-4483-99f9-e2ac6fff6ff1" target="_blank">
                                                    4 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;2392c5aa-e78c-493f-8abd-6d47be11c338&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;s604h2xtL5hT3EVysWf0&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;0bb1d580357d89f99f2aa482d361823aa6f33efffa78829f11b02d3db20ec9c0&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="s604h2xtL5hT3EVysWf0" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/5a533405-96a8-44cd-b8ba-00038bba09aa">Maddox Snyder</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '14c82e87-fc3a-495d-beee-89cb1ecf6cd0'})">
                                                High School - 109 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/14c82e87-fc3a-495d-beee-89cb1ecf6cd0/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/14c82e87-fc3a-495d-beee-89cb1ecf6cd0" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/2392c5aa-e78c-493f-8abd-6d47be11c338" target="_blank">
                                                    0 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;3b24868c-eada-4e97-94cc-5358b38e1bc2&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;L0CkG1mzRvN6i6kKc9vK&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;09f2975eaa0e14e33bb1dd676748aa250d9a65664b5d4633ab401d130b56a8f0&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="L0CkG1mzRvN6i6kKc9vK" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/0ad9bd59-a163-4172-aaed-263c0f718f2d">Malachi Thullner</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '4d7e1239-a1c8-40c6-8502-87cb15b4515f'})">
                                                High School - 147 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/4d7e1239-a1c8-40c6-8502-87cb15b4515f/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/4d7e1239-a1c8-40c6-8502-87cb15b4515f" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/3b24868c-eada-4e97-94cc-5358b38e1bc2" target="_blank">
                                                    3 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;65a58eee-1768-42b7-a5a8-2286ec4dc8c1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;cZPoVlJLdjk7NEhLwMCZ&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;4f5c7af678a769d37046fe43471a7824c3d3efc0037a1b0581fd56bf22c2f227&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="cZPoVlJLdjk7NEhLwMCZ" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/b4d7e481-3fb5-4f1f-af61-0f5d8633b2a3">Hudson Trahin</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '11e31b79-a499-46bc-8d27-570e05eef152'})">
                                                High School - 116 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/11e31b79-a499-46bc-8d27-570e05eef152/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/11e31b79-a499-46bc-8d27-570e05eef152" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/65a58eee-1768-42b7-a5a8-2286ec4dc8c1" target="_blank">
                                                    6 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;f2bec1d5-074a-42bd-b946-5592ac3411ac&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;Z6Wf6odv58rcUmSEDdxb&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;7f18b98be3cea7ab573d4db51db2d8157757f201a97ca15c5f4fd800137f8e2e&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="Z6Wf6odv58rcUmSEDdxb" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/3a1925a3-b6c0-430f-9228-662cdc31143d">Joseph Warner</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: '14c82e87-fc3a-495d-beee-89cb1ecf6cd0'})">
                                                High School - 109 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/14c82e87-fc3a-495d-beee-89cb1ecf6cd0/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/14c82e87-fc3a-495d-beee-89cb1ecf6cd0" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/f2bec1d5-074a-42bd-b946-5592ac3411ac" target="_blank">
                                                    14.5 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                            <div class="mx-auto w-full my-2 max-w-md rounded border border-usa-blue overflow-hidden shadow-md text-xs">
                            <div wire:snapshot="{&quot;data&quot;:{&quot;wrestler&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventWrestler&quot;,&quot;key&quot;:&quot;3fc670a9-8b90-433d-ac3d-430f4308dd0a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;context&quot;:&quot;my_wrestler&quot;,&quot;unreleased&quot;:[{&quot;division_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;weight_ids&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}]},{&quot;s&quot;:&quot;arr&quot;}],&quot;show_matches&quot;:[[],{&quot;s&quot;:&quot;arr&quot;}],&quot;active_streams&quot;:[{&quot;b374656c-a263-4451-967f-212d25df8783&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;14788bc5-ef50-4e74-bba2-ebf69e926f98&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;3bf0006f-6da2-49b3-adda-dfaf5a7994de&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;1fa39250-66fe-49cf-879c-3d26c0c0bef7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8435bf27-144b-431b-86c5-eb731c00d636&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;274e4197-8096-43af-84de-8edb78f06496&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;fedefb55-36d6-4ca0-9f2e-8bfde8db596d&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;29aa1431-45e0-48d5-bdcf-d337a17292df&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;4918d08d-23da-47d8-a76a-1c0aebd15d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;37e691f9-f396-4ee4-8528-548ef5f2de13&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;35453ad5-84af-403d-bcd9-09a658e32d00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;383988c1-9c16-4b21-b1ef-71a009465bd6&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;dde8447c-e695-4bbb-ab8e-938db2d61c41&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;3a2b82e2-3789-408e-8833-c36b8ab32473&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;495dab43-f12c-4a07-bbe9-302c84870dc2&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7b64f747-8a7b-4d4e-bf80-401d6b14cd4f&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;10947cd5-c1d9-4ec7-97bd-8583c0b8b993&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;7c98642e-de12-4074-bab2-d60258d05db0&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b2de0ee0-2d05-4e8e-a36d-629746f6bce8&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;8c4723ed-9825-427e-b19b-9f5759bca9d3&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;8a4d4413-cfef-475a-a250-55c627c00d31&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;9704374d-a462-4f4d-8826-94e776cc8cde&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;c7e1dd50-a2cb-4989-9e74-0daf35ad0a00&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;a41c45c4-de0a-4680-9aaa-11950b346e4a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;29584cfd-fa30-4fb4-87cf-327aef20b848&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;b2296a2b-4ae4-491a-9019-ce9eb332c0e1&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;ac8365f3-4b80-473a-bf31-53a7f693cb49&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;c7ca65d8-9009-4d1e-b57a-f488abad254a&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;2bcb21d6-343b-4811-a9dd-02f583d7c845&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;d63c0b7d-9c15-408b-8e03-82068945c568&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;03fe1fee-8c80-44c0-aff1-dfa82c22f649&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;dfddad76-e120-4ed3-8378-c4b1c12fadb7&quot;,&quot;s&quot;:&quot;mdl&quot;}],&quot;b573f5d0-3d09-4fa6-886e-396486901d4b&quot;:[null,{&quot;class&quot;:&quot;App\\Models\\EventMatStream&quot;,&quot;key&quot;:&quot;e66c652c-a157-4a97-9769-e0cdfba04491&quot;,&quot;s&quot;:&quot;mdl&quot;}]},{&quot;class&quot;:&quot;Illuminate\\Support\\Collection&quot;,&quot;s&quot;:&quot;clctn&quot;}]},&quot;memo&quot;:{&quot;id&quot;:&quot;wbBT2CI85fFnQPIgavY2&quot;,&quot;name&quot;:&quot;my-wrestler&quot;,&quot;path&quot;:&quot;events\/420e5e7f-184f-4723-a9f0-008cef564cd5\/my_wrestlers&quot;,&quot;method&quot;:&quot;GET&quot;,&quot;children&quot;:[],&quot;scripts&quot;:[],&quot;assets&quot;:[],&quot;errors&quot;:[],&quot;locale&quot;:&quot;en&quot;},&quot;checksum&quot;:&quot;b4da8636785b0109083145a8970e7c24f19aa43ce77610baf47568822a1c204b&quot;}" wire:effects="{&quot;listeners&quot;:[&quot;toggleMatches&quot;,&quot;refresh&quot;]}" wire:id="wbBT2CI85fFnQPIgavY2" class="mb-2" style="font-size:1.2em;">
            <div style="text-align:left;" class="p-2 bg-gray-200 border-b border-usa-blue flex font-bold">
                            <a class="font-bold text-usa-blue underline mr-1" target="_blank" href="https://www.usabracketing.com/athletes/8d9b1c66-e942-4b47-8e76-7f28abcd8991">Nolan Winicker</a>
                         (The Fort Hammers, IN)
        </div>
        <div class="space-y-4 mt-2 pl-2 pr-2 mb-6">
        
                                                                                                                                    <div class="space-y-6">
                                    <!-- Weight Class + Header -->
                                    <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-300">
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-sm font-semibold text-gray-700">
                                              <span class="text-usa-blue underline cursor-pointer" wire:click="$dispatchSelf('toggleMatches', { weight_id: 'e9459944-d2b9-408c-9a5f-45d26ad7d284'})">
                                                High School - 168 - (DNP)
                                              </span>
                                            </p>
                                            <div class="flex items-center space-x-2 text-sm text-usa-blue">
                                                <a href="https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/weights/e9459944-d2b9-408c-9a5f-45d26ad7d284/wrestlers" title="View Wrestlers">
                                                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                                                </a>
                                                                                                    <a href="/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/e9459944-d2b9-408c-9a5f-45d26ad7d284" target="_blank" title="View Bracket">
                                                        <i class="fak fa-wrestling-bracket"></i>
                                                    </a>
                                                                                                <a href="/events/team_scoring/wrestler/3fc670a9-8b90-433d-ac3d-430f4308dd0a" target="_blank">
                                                    3 pts
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Matches -->
                                                                            </div>
                                </div>
                                                                                                                
            </div>
    <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
</div>
                        </div>
                                    </div>
            </div>
        
        <div x-init="$watch('open', value =&gt; document.body.classList.toggle('overflow-hidden'))" x-data="{ open: false, deleteText: '', syncText: '' }" class="inline-block" x-on:show-modal.window="open = true;" x-on:close-modal.window="open = false;" @keydown.window.escape="open = false;">
    
    <div style="position: relative; z-index: 5001;" aria-labelledby="displayTitle" role="dialog" aria-modal="true" x-show="open" id="display" tabindex="-1">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" x-show="open"></div>

        <div class="fixed inset-0 z-50 overflow-y-auto" @click.stop="">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                <div x-show="open" class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">

                                            <div class="flex flex-shrink-0 items-center justify-between bg-usa-nav-gray border-b border-gray-200 px-4 py-3">
                            <span id="displayLabel" class="text-xl font-medium leading-normal">Display</span>
                            <button x-on:click="open = false; deleteText = ''; syncText = '';" type="button" class="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline" aria-label="Close" wire:click="$dispatch('closeModal')"></button>
                        </div>
                    
                    
                    <div class="bg-white px-4 py-5 sm:p-6 sm:pb-4 overflow-auto">
                        <div id="display_content"><div class="mx-auto w-full md:w-auto my-2 p-2 max-w-md rounded overflow-hidden shadow-md text-sm"><div style="font-weight:bold;font-size:1.1em;padding:.5em;text-align:center;"><span class="my-4045e013-504e-4f89-98c0-eea699e1a3c9"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/83580871-ad66-4c06-b891-2909d228f82d">Hunter Douglas</a></span>, TFH over <span class="my-8472e1ca-287c-46ea-9616-69eb2f12536e"><a style="text-decoration:underline;" target="_blank" href="https://www.usabracketing.com/athletes/4d56a13b-1b54-4e93-a14f-0be1f215b417">Aslan Templeton</a></span>, MCWC (TF 21-4 (2:47))</div><table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                    <tbody><tr>
                        <td style="width:50%;"><div class="border-r border-b border-gray-500 p-2" style="text-align:center;font-size:1.1em;font-weight:bold;color:white;background-color: #007500;">Hunter <a style="text-decoration: underline;" target="_blank" href="/athletes/83580871-ad66-4c06-b891-2909d228f82d">Douglas</a></div></td>
                        <td style="width:50%;"><div class="border-l border-b border-gray-500 p-2" style="text-align:center;font-size:1.1em;font-weight:bold;color:white;background-color: #FF0000;">Aslan <a style="text-decoration: underline;" target="_blank" href="/athletes/4d56a13b-1b54-4e93-a14f-0be1f215b417">Templeton</a></div></td>
                    </tr>
                </tbody></table><div style="font-weight:bold;text-align:center;font-size:1.1em;padding:.3em;background-color:#dddddd;">Period 1</div><div style="text-align:left;padding:.2em;;color:#007500">Takedown (1:47)</div><div style="text-align:right;padding:.2em;;color:#FF0000">Escape (1:26)</div><div style="text-align:left;padding:.2em;;color:#007500">Takedown (1:11)</div><div style="text-align:left;padding:.2em;;color:#007500">Nearfall 4 (0:52)</div><div style="text-align:right;padding:.2em;;color:#FF0000">Escape (0:49)</div><div style="text-align:left;padding:.2em;;color:#007500">Takedown (0:15)</div><div style="text-align:right;padding:.2em;;color:#FF0000">Escape (0:10)</div><div style="font-weight:bold;text-align:center;font-size:1.1em;padding:.3em;background-color:#dddddd;">Choice 1</div><div style="text-align:left;padding:.2em;;color:#007500">Neutral ()</div><div style="font-weight:bold;text-align:center;font-size:1.1em;padding:.3em;background-color:#dddddd;">Period 2</div><div style="text-align:left;padding:.2em;;color:#007500">Takedown (1:22)</div><div style="text-align:right;padding:.2em;;color:#FF0000">Escape (1:16)</div><div style="text-align:left;padding:.2em;;color:#007500">Takedown (0:46)</div><div style="text-align:left;padding:.2em;;color:#007500">Nearfall 2 (0:43)</div><div style="font-weight:bold;text-align:center;font-size:1.1em;padding:.3em;background-color:#dddddd;">Score</div><table cellspacing="0" cellpadding="0" border="0" style="width:100%;"><tbody><tr><td style="width:50%;"><div style="font-weight:bold;font-size:1.1em;text-align:left;padding:.2em;color:#007500">21</div></td><td style="width:50%;"><div style="font-weight:bold;font-size:1.1em;text-align:right;padding:.2em;;color:#FF0000">4</div></td></tr></tbody></table></div></div>
                    </div>

                    
                    <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-x-3">
                        
                        <button type="button" class="button bg-usa-blue disabled:cursor-not-allowed button-secondary" wire:click="$dispatch('closeModal')" x-on:click.stop="open = false; deleteText = ''; syncText = '';">
            Cancel
    </button>
                    </div>

                    
                </div>
            </div>
        </div>
    </div>
</div>

    </div>
                    </div>
                            </main>
        </div>

        
        <!-- Scripts -->
        
        <script src="https://www.usabracketing.com/vendor/livewire/livewire.min.js?id=df3a17f2" data-csrf="BAFUeGVmo1QHuvEMCt7wxiw6ZfXH8B2SXlGoGwzp" data-update-uri="/livewire/update" data-navigate-once="true"></script>
        <script src="/js/app.js?id=cae1e84ba5d0ef1ffc6ff632451629cc"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.3/flowbite.min.js"></script>
        <script>
    /**** Livewire Alert Scripts ****/
    (()=>{var __webpack_modules__={757:(e,t,r)=>{e.exports=r(666)},666:e=>{var t=function(e){"use strict";var t,r=Object.prototype,n=r.hasOwnProperty,o="function"==typeof Symbol?Symbol:{},i=o.iterator||"@@iterator",a=o.asyncIterator||"@@asyncIterator",c=o.toStringTag||"@@toStringTag";function s(e,t,r){return Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{s({},"")}catch(e){s=function(e,t,r){return e[t]=r}}function l(e,t,r,n){var o=t&&t.prototype instanceof y?t:y,i=Object.create(o.prototype),a=new x(n||[]);return i._invoke=function(e,t,r){var n=f;return function(o,i){if(n===_)throw new Error("Generator is already running");if(n===d){if("throw"===o)throw i;return S()}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var c=L(a,r);if(c){if(c===h)continue;return c}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===f)throw n=d,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=_;var s=u(e,t,r);if("normal"===s.type){if(n=r.done?d:p,s.arg===h)continue;return{value:s.arg,done:r.done}}"throw"===s.type&&(n=d,r.method="throw",r.arg=s.arg)}}}(e,r,a),i}function u(e,t,r){try{return{type:"normal",arg:e.call(t,r)}}catch(e){return{type:"throw",arg:e}}}e.wrap=l;var f="suspendedStart",p="suspendedYield",_="executing",d="completed",h={};function y(){}function v(){}function b(){}var m={};s(m,i,(function(){return this}));var w=Object.getPrototypeOf,g=w&&w(w(D([])));g&&g!==r&&n.call(g,i)&&(m=g);var O=b.prototype=y.prototype=Object.create(m);function E(e){["next","throw","return"].forEach((function(t){s(e,t,(function(e){return this._invoke(t,e)}))}))}function k(e,t){function r(o,i,a,c){var s=u(e[o],e,i);if("throw"!==s.type){var l=s.arg,f=l.value;return f&&"object"==typeof f&&n.call(f,"__await")?t.resolve(f.__await).then((function(e){r("next",e,a,c)}),(function(e){r("throw",e,a,c)})):t.resolve(f).then((function(e){l.value=e,a(l)}),(function(e){return r("throw",e,a,c)}))}c(s.arg)}var o;this._invoke=function(e,n){function i(){return new t((function(t,o){r(e,n,t,o)}))}return o=o?o.then(i,i):i()}}function L(e,r){var n=e.iterator[r.method];if(n===t){if(r.delegate=null,"throw"===r.method){if(e.iterator.return&&(r.method="return",r.arg=t,L(e,r),"throw"===r.method))return h;r.method="throw",r.arg=new TypeError("The iterator does not provide a 'throw' method")}return h}var o=u(n,e.iterator,r.arg);if("throw"===o.type)return r.method="throw",r.arg=o.arg,r.delegate=null,h;var i=o.arg;return i?i.done?(r[e.resultName]=i.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,h):i:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,h)}function j(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function P(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function x(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(j,this),this.reset(!0)}function D(e){if(e){var r=e[i];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,a=function r(){for(;++o<e.length;)if(n.call(e,o))return r.value=e[o],r.done=!1,r;return r.value=t,r.done=!0,r};return a.next=a}}return{next:S}}function S(){return{value:t,done:!0}}return v.prototype=b,s(O,"constructor",b),s(b,"constructor",v),v.displayName=s(b,c,"GeneratorFunction"),e.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===v||"GeneratorFunction"===(t.displayName||t.name))},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,b):(e.__proto__=b,s(e,c,"GeneratorFunction")),e.prototype=Object.create(O),e},e.awrap=function(e){return{__await:e}},E(k.prototype),s(k.prototype,a,(function(){return this})),e.AsyncIterator=k,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new k(l(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},E(O),s(O,c,"Generator"),s(O,i,(function(){return this})),s(O,"toString",(function(){return"[object Generator]"})),e.keys=function(e){var t=[];for(var r in e)t.push(r);return t.reverse(),function r(){for(;t.length;){var n=t.pop();if(n in e)return r.value=n,r.done=!1,r}return r.done=!0,r}},e.values=D,x.prototype={constructor:x,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(P),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function o(n,o){return c.type="throw",c.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var s=n.call(a,"catchLoc"),l=n.call(a,"finallyLoc");if(s&&l){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!l)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=e,a.arg=t,i?(this.method="next",this.next=i.finallyLoc,h):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),h},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.finallyLoc===e)return this.complete(r.completion,r.afterLoc),P(r),h}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.tryLoc===e){var n=r.completion;if("throw"===n.type){var o=n.arg;P(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:D(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),h}},e}(e.exports);try{regeneratorRuntime=t}catch(e){"object"==typeof globalThis?globalThis.regeneratorRuntime=t:Function("r","regeneratorRuntime = r")(t)}}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var r=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](r,r.exports,__webpack_require__),r.exports}__webpack_require__.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(t,{a:t}),t},__webpack_require__.d=(e,t)=>{for(var r in t)__webpack_require__.o(t,r)&&!__webpack_require__.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},__webpack_require__.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var __webpack_exports__={};(()=>{"use strict";var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(757),_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function _objectSpread(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach((function(t){_defineProperty(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function asyncGeneratorStep(e,t,r,n,o,i,a){try{var c=e[i](a),s=c.value}catch(e){return void r(e)}c.done?t(s):Promise.resolve(s).then(n,o)}function _asyncToGenerator(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var i=e.apply(t,r);function a(e){asyncGeneratorStep(i,n,o,a,c,"next",e)}function c(e){asyncGeneratorStep(i,n,o,a,c,"throw",e)}a(void 0)}))}}function evalCallbacksOptions(options){for(var callbacksKeysAllowed=["allowOutsideClick","allowEscapeKey","allowEnterKey","loaderHtml","inputOptions","inputValidator","preConfirm","preDeny","didClose","didDestroy","didOpen","didRender","willClose","willOpen"],_i=0,_callbacksKeysAllowed=callbacksKeysAllowed;_i<_callbacksKeysAllowed.length;_i++){var callbackKey=_callbacksKeysAllowed[_i];options.hasOwnProperty(callbackKey)&&("string"==typeof options[callbackKey]||options[callbackKey]instanceof String)&&options[callbackKey]&&""!=options[callbackKey].trim()&&(options[callbackKey]=eval(options[callbackKey]))}}function afterAlertInteraction(e){if(e.confirmed)return"self"===e.onConfirmed.component?void Livewire.find(e.onConfirmed.id).dispatchSelf(e.onConfirmed.listener,e.result):void Livewire.dispatchTo(e.onConfirmed.component,e.onConfirmed.listener,e.result);if(e.isDenied)return"self"===e.onDenied.component?void Livewire.find(e.onDenied.id).dispatchSelf(e.onDenied.listener,e.result):void Livewire.dispatchTo(e.onDenied.component,e.onDenied.listener,e.result);if(e.onProgressFinished&&e.dismiss===Swal.DismissReason.timer)return"self"===e.onProgressFinished.component?void Livewire.find(e.onProgressFinished.id).dispatchSelf(e.onProgressFinished.listener,e.result):void Livewire.dispatchTo(e.onProgressFinished.component,e.onProgressFinished.listener,e.result);if(e.onDismissed){if("self"===e.onDismissed.component)return void Livewire.find(e.onDismissed.id).dispatch(e.onDismissed.listener,e.result);Livewire.dispatchTo(e.onDismissed.component,e.onDismissed.listener,e.result)}}window.addEventListener("alert",function(){var e=_asyncToGenerator(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark((function e(t){var r,n,o,i,a,c,s,l;return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=t.detail.message,i=null!==(r=t.detail.type)&&void 0!==r?r:null,a=t.detail.data,c=t.detail.events,evalCallbacksOptions(s=t.detail.options),e.next=8,Swal.fire(_objectSpread({title:o,icon:i},s));case 8:afterAlertInteraction(_objectSpread(_objectSpread(_objectSpread({confirmed:(l=e.sent).isConfirmed,denied:l.isDenied,dismiss:l.dismiss,result:_objectSpread(_objectSpread({},l),{},{data:_objectSpread(_objectSpread({},a),{},{inputAttributes:null!==(n=s.inputAttributes)&&void 0!==n?n:null})})},c),l),s));case 10:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),window.flashAlert=function(){var e=_asyncToGenerator(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark((function e(t){var r,n,o,i,a,c,s;return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=t.events,a=t.events.data,evalCallbacksOptions(c=t.options),e.next=6,Swal.fire(_objectSpread({title:null!==(r=t.message)&&void 0!==r?r:"",icon:null!==(n=t.type)&&void 0!==n?n:null},c));case 6:afterAlertInteraction(_objectSpread(_objectSpread({confirmed:(s=e.sent).isConfirmed,denied:s.isDenied,dismiss:s.dismiss,result:_objectSpread(_objectSpread({},s),{},{data:_objectSpread(_objectSpread({},a),{},{inputAttributes:null!==(o=c.inputAttributes)&&void 0!==o?o:null})})},i),t.options));case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()})()})();
</script>

        <script>
            Livewire.on('showModal', modalId => {
                $('#'+modalId).modal('show');
            })
            Livewire.on('hideModal', modalId => {
                $('#'+modalId).modal('hide');
            })
        </script>
        <script src="https://www.usabracketing.com/vendor/sweetalert/sweetalert.all.js"></script>
        <style>
            .swal2-container {
                z-index: 7000;
            }
        </style>
                <script>
            var division_ids = ["fad123d1-39a6-4f3a-9b37-c2a360227ef4"];
            function toggleUserFilter(){
                var f = document.getElementById("user_filter_frame");
                if(f){
                    f.style.display = f.style.display=="none" ? "block" : "none";
                }
            }
            function applyFilter(){
                var selected_division_ids = "";
                var f;
                for(var i=0;i<division_ids.length;i++){
                    f = document.getElementById("user_division_" + division_ids[i]);
                    if(f && f.checked){
                        if(selected_division_ids!="") selected_division_ids += ",";
                        selected_division_ids += division_ids[i];
                    }
                }
                location.href = "https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5?division_ids="+(selected_division_ids=="" ? "delete" : selected_division_ids);
            }
            function clearFilter(){
                var f;
                for(var i=0;i<division_ids.length;i++){
                    f = document.getElementById("user_division_" + division_ids[i]);
                    if(f){
                        f.checked = false;
                    }
                }
            }
        </script>
    
        <script src="/js/score_summary.js?key=1442317227"></script>

        <script>

            var fetchCounter = 0;

            function fetchUpcomingMatches(mat_id) {
                $.post( "/api/dashboard/upcoming_matches", { event_id: "420e5e7f-184f-4723-a9f0-008cef564cd5", "mat_ids[]": mat_id})
                    .done(function( data ) {
                        receivedUpcomingMatches(data);
                    });
            }

            function receivedUpcomingMatches(req) {
                console.log("receivedUpcomingMatches()");

                var result = req;

                if (result.status == "success") {
                    var bouts = result.event_bouts;
                    if (bouts != null && bouts.length > 0) {
                        var html = "";
                        var bout;
                        for (var i = 0; i < bouts.length; i++) {
                            bout = bouts[i];
                            html += formatUpcomingMatch(bout);
                        }
                        window.dispatchEvent(
                            new CustomEvent('show-modal')
                        )
                        document.getElementById("display_content").innerHTML = html;
                    } else {
                        alert("There are no upcoming bouts associated with this mat.")
                    }
                } else {
                    alert(result.message);
                }

            }

            function formatUpcomingMatch(bout) {
                var html = "";
                html += "<div style='border-bottom:1px solid black;padding-top:.5em;'>";
                html += "<div><a style='text-decoration:underline;' target=_blank href='/events/420e5e7f-184f-4723-a9f0-008cef564cd5/brackets/" + bout.weight_id + "'>" + bout.division_weight + "</a> (Bout " + bout.bout_number + ")</div>";
                html += "<div style='font-weight:normal;'>" + maxLen(bout.wrestler1.first_name, 10) + " " + maxLen(bout.wrestler1.last_name, 15) + "" + bout.wrestler1.extension + " (" + maxLen(bout.wrestler1.team.name, 25) + ")</div>";
                html += "<div style='font-weight:normal;'>" + maxLen(bout.wrestler2.first_name, 10) + " " + maxLen(bout.wrestler2.last_name, 15) + "" + bout.wrestler2.extension + " (" + maxLen(bout.wrestler2.team.name, 25) + ")</div>";
                html += "</div>";
                return html;
            }

            function goTo(url){
                if(url=="add_wrestlers"){
                    window.location = "https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers/wrestlers/create";
                }else if(url=="edit_wrestlers"){
                    window.location = "https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers/wrestlers";
                }else if(url=="add_teams"){
                    window.location = "https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers/teams/create";
                }else if(url=="edit_teams"){
                    window.location = "https://www.usabracketing.com/events/420e5e7f-184f-4723-a9f0-008cef564cd5/my_wrestlers/teams";
                }
            }

            function shareMyWrestlers(){
                var f = document.getElementById("share_frame");
                if(f){
                    f.style.display = f.style.display=="none" ? "block" : "none";
                }
            }

        </script>
        

<div id="draggable-live-region" aria-relevant="additions" aria-atomic="true" aria-live="assertive" role="log" style="position: fixed; width: 1px; height: 1px; top: -1px; overflow: hidden;"></div></body>