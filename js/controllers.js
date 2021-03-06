angular.module('starter.controllers', [])

        .controller('SignInCtrl', function ($scope, $rootScope, $state, $ionicHistory, fireBaseData, $firebase) {

            $scope.hideBackButton = true;
    
            /* FOR DEV PURPOSES */
            $scope.user = {
                email: "johndoe@gmail.com",
                password: "password"
            };
            
            $scope.signIn = function (user) {

                $rootScope.show('Logging In...');
                
                /* Check user fields*/
                if(!user || !user.email || !user.password){
                    $rootScope.alertPopup('Error','Email or Password is incorrect!');
                    return;
                }
                
                /* All good, let's authentify */
                fireBaseData.ref().authWithPassword({
                    email    : user.email,
                    password : user.password
                }, function(error, authData) {
                    if (error === null) {
                        $rootScope.hide();
                        $state.go('tabs.dashboard');
                    } else {
                        $rootScope.hide();
                        $rootScope.alertPopup('Error','Email or Password is incorrect!');
                    }
                });
            };

        })

        .controller('RegisterCtrl', function ($scope, $rootScope, $state, $firebase, fireBaseData, $firebaseAuth) {
            $scope.hideBackButton = true;
            
            /* FOR DEV PURPOSES */
            $scope.user = {
                firstname: "John",
                surname: "Doe",
                email: "johndoe@gmail.com",
                password: "password"
            };
            
            $scope.createUser = function (user) {
                var firstname = user.firstname;
                var surname = user.surname;
                var email = user.email;
                var password = user.password;

                if (!firstname || !surname || !email || !password) {
                    $rootScope.notify("Please enter valid credentials");
                    return false;
                }

                $rootScope.show('Registering...');
                
                var auth = $firebaseAuth(fireBaseData.ref());
                auth.$createUser(email, password).then(function (error) {
                    console.log("User created successfully!");
                    return auth.$authWithPassword({
                        email: email,
                        password: password
                    });
                }).then(function (authData) {
                    
                    /* PREPARE DATA FOR FIREBASE*/
                    $scope.temp = {
                        firstname: user.firstname,
                        surname: user.surname,
                        email: user.email,
                        created: Date.now(),
                        updated: Date.now()
                    }
                    
                    /* SAVE PROFILE DATA */
                    var usersRef = fireBaseData.refRoomMates();
                    var myUser = usersRef.child(escapeEmailAddress(user.email));
                    myUser.set($scope.temp, function(){
                        $rootScope.hide();
                        $state.go('introduction'); 
                    }); 
                    
                }).catch(function (error) {
                    if (error.code == 'INVALID_EMAIL') {
                        $rootScope.hide();
                        $rootScope.notify('Error','Invalid Email.');
                    }
                    else if (error.code == 'EMAIL_TAKEN') {
                        $rootScope.hide();
                        $rootScope.notify('Error','Email already taken.');
                    }
                    else {
                        $rootScope.hide();
                        $rootScope.notify('Error','Oops. Something went wrong.');
                    }
                });
            };
        })

        .controller('IntroductionCtrl', function ($scope, $state, $ionicHistory) {
            $ionicHistory.clearHistory();
            $scope.hideBackButton = true;
            
            $scope.registerHouse = function (user) {
                $state.go('register-house');
            };
            $scope.joinHouse = function (user) {
                $state.go('join-house');
            };
        })

        .controller('RegisterHouseCtrl', function ($scope, $state, $ionicHistory, fireBaseData, $firebase, $rootScope) {
            
            $ionicHistory.clearHistory();
            $scope.hideBackButton = true;
            
            /* FOR DEV PURPOSES */
            $scope.house = {
                name: "Crunchy Town",
                currency: "AUD"
            };
            
            $scope.createHouse = function (house) {
                
                $rootScope.show('Creating...');
                var house_name = house.name;
                var house_currency = house.currency;
                
                /* VERIFY USER FIELD */
                if(!house_name || !house_currency){
                    $rootScope.hide();
                    $rootScope.alertPopup('Error','Please fill in the fields correctly');
                    return;
                }
                
                /* GET CURRENT USER */
                var ref = fireBaseData.ref();
                $rootScope.authData = ref.getAuth();
                
                /* PREPARE DATA */
                $scope.temp = {
                    name: house_name,
                    currency: house_currency,
                    admin: $rootScope.authData.password.email,
                    created: Date.now(),
                    updated: Date.now(),
                    users: [$rootScope.authData.password.email],
                    userInvited: []
                };
                
                /* SAVE HOUSE DATA */
                var myHouses = fireBaseData.refHouses();
                var sync = $firebase(myHouses);
                sync.$push($scope.temp).then(function(newChildRef) {
                    $rootScope.hide();
                    $state.go('tabs.dashboard'); 
                });

            };
            
        })

        .controller('joinHouseCtrl', function ($scope, $state, $ionicHistory) {
            $ionicHistory.clearHistory();
            $scope.hideBackButton = true;
        })

        .controller('DashboardCtrl', function ($scope, $rootScope, $state, $translate, fireBaseData) {
            $rootScope.refreshData();
            $scope.currentUser = $rootScope.currentUser;
            $scope.currentHouse = $rootScope.currentHouse;
        })

        .controller('SettingsCtrl', function ($scope, $rootScope, $state, $translate, fireBaseData, $ionicHistory) {

            /* LOGOUT BUTTON */
            $scope.logout = function () {
                $ionicHistory.clearCache();
                fireBaseData.ref().unauth();
                $rootScope.checkSession();
            };
            
            /* SETTINGS LANGUAGES */
            $scope.languages = $rootScope.settings.languages;
            $scope.selectLanguage = $rootScope.settings.languages[0];
            $scope.updateLanguage = function (language) {
                $translate.use(language.prefix);
            };  
        })
        
        .controller('MembersCtrl', function ($scope, $rootScope, $state) {
            $scope.members = $rootScope.members;
        })
        
        .controller('MembersDetailCtrl', function ($scope, $rootScope, $state, $stateParams) {
            var thisid = ($stateParams.memberId - 1);
            $scope.member = $rootScope.members[thisid];
        });

       
function escapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
}

function unescapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\,/g, '.');
    return email;
}