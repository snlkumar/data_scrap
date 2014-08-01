(function(window) {

  return {

    defaultState: 'loading',
    zenDeskSubdomain: 'trigma1',
    redboothClientId: '29f790efe07f98a98a13815959e0a941e56625736b64c913b8a112d65468ef03',
    accessTokenValue: '',
    CurUserIdForDropdown: '',
    rbTaskId: '',
    rbTaskName: '',
    rbTaskdescription: '',
    rbProjectId: '',
    rbTaskListId: '',
    rbAssignedId: '',
    rbDueDate: '',
    zdUserId: '',
    zdTicketId: '',
    zdTicketComment: '',
    //mdArray: Array(),
    //arrCounter: 0,
    //j: 0,

    events: {
      'app.activated': 'onActivate',

      'click .login': 'login',

      'click .logout': 'logout',

      'click .btnTask': function(event) {
        event.preventDefault(); 
        this.rbTaskListId = this.$('#tasklistId').val();
        this.rbAssignedId = this.$('#assignedToId').val().toString();
        this.rbDueDate = this.$('#dueDate').val().toString();
        console.log('date ' + this.rbDueDate);
        console.log(this.rbAssignedId);
        this.ajax('createTasks')
            .done(function (data) {
                    this.switchTo('taskcreated');
                    this.setTicketInfo(data);
                    console.info(data);
                   
                    this.ajax('updateZendeskTicket')
							.done(function (data) {
                                console.info(data);
                            }); 
                    this.ajax('addComment')
                        .done(function (data) {
                                console.info(data);
                            }); 
                })        
                .fail(function (e){
                   console.info(e);			
			});
      },
/*
      $('select#prjId').change(function() {

       }
*/
      'change #prjId': function(event) {
        event.preventDefault();
        this.$("#spinner").show(); 
        this.$('#tasklistId').prop("disabled", true);
        this.$('#assignedToId').prop("disabled", true);
        this.$('#dueDate').prop("disabled", true);
        this.rbProjectId = this.$('#prjId').val();
        this.$('#tasklistId').empty();
        this.ajax('getTasklists')
            .done(function (data) {
                    console.info(data);
                    for (var key in data)
                    {
                       if (data.hasOwnProperty(key))
                       {
                          // here you have access to
                          this.$('#tasklistId')
                            .append(this.$("<option></option>")
                                    .attr("value",data[key].id)
                                    .text(data[key].name)) 
                            .prop("disabled", false); 
                            console.log(data[key].name);
                       }
                    }
                });  
        this.$('#assignedToId').empty();
        this.ajax('getProjectMembers')
            .done(function (data) {
                    console.info(data);
                    var userName = '';
                    //this.mdArray = [];
                    //this.arrCounter = 0;
                    for (var key in data)
                    {
                       if (data.hasOwnProperty(key))
                       {
                          console.log("Assigned Id: " + data[key].user_id);
                          this.populateAssignedTo(data[key].user_id);
                          //this.arrCounter = this.arrCounter + 1;
                       }
                    }

/*
                    for(this.j=0; this.j<this.arrCounter; this.j++){
                        this.$('#assignedToId')
                            .append(this.$("<option></option>")
                                .attr("value",this.mdArray[this.j][0])
                                .text(this.mdArray[this.j][1]));
                    }

*/


                    this.$('#assignedToId').prop("disabled", false);
                    this.$('#dueDate').prop("disabled", false);
                    this.$("#spinner").hide();
                });  
      }

    },

    requests: {

      createTasks: function() {
         alert("i am in create task");
        return {
          url: 'http://127.0.0.1/redbooths/create_task',
          type: 'POST',
          headers: { "Authorization" : "Bearer " + this.accessTokenValue, "Content-type" : "application/json"},
          proxy_v2: true,
          data: JSON.stringify({"name": this.rbTaskName, "description": this.rbTaskdescription, "project_id": this.rbProjectId,"task_list_id":this.rbTaskListId, "type":"Task","is_private":false,"urgent":false})
        };
      },

      addComment: function() {
        return {
          url: 'https://redbooth.com/api/3/comments',
          type: 'POST',
          headers: { "Authorization" : "Bearer " + this.accessTokenValue, "Content-type" : "application/json"},
          proxy_v2: true,
          data: JSON.stringify({"body": "this is test", "due_on": 1401484888, "project_id": this.rbProjectId, "target_id": this.rbTaskId, "target_type": "Task"})
        };
      },

      getProjects: function() {
        return {
          url: 'https://redbooth.com/api/3/projects',
          type: 'GET',
          headers: { "Authorization" : "Bearer " + this.accessTokenValue},
          proxy_v2: true
        };
      },     

      getTasklists: function() {
        var currentPrjId = this.$('#prjId').val(); 
        return {
          url: 'https://redbooth.com/api/3/task_lists?project_id=' + currentPrjId,
          type: 'GET',
          headers: { "Authorization" : "Bearer " + this.accessTokenValue},
          proxy_v2: true
        };
      },

      getProjectMembers: function() {
        var currentPrjId = this.$('#prjId').val(); 
        return {
          url: 'https://redbooth.com/api/3/people?project_id=' + currentPrjId,
          type: 'GET',
          headers: { "Authorization" : "Bearer " + this.accessTokenValue},
          proxy_v2: true
        };
      },

      getMemberDetails: function() {
        return {
          url: 'https://redbooth.com/api/3/users/' + this.CurUserIdForDropdown,
          type: 'GET',
          headers: { "Authorization" : "Bearer " + this.accessTokenValue},
          proxy_v2: true
        };
      },

      getZendeskTicket: function() {
        return {
          url: '/api/v2/tickets/' + this.zdTicketId + '.json',
          type: 'GET'
        };
      },

      updateZendeskTicket: function() {
        return {
          url: '/api/v2/tickets/' + this.zdTicketId + '.json',
          type: 'PUT',
          headers: {"Content-Type" : "application/json"},
          data: JSON.stringify({"ticket":{"comment":{"public":false, "body": this.zdTicketComment}}})
        };
      },  

      addCustomZendeskTicket: function() {
        return {
          url: '/api/v2/tickets/' + this.zdTicketId + '.json',
          type: 'POST',
          headers: {"Content-Type" : "application/json"},
          data: JSON.stringify({"ticket":{"comment":{"public":false, "body": this.zdTicketComment}}})
        };
      },

      storeAccessToken: function() {
        return {
          url: 'http://zendesk-app.herokuapp.com/tokens',
          type: 'POST',
          headers: {"Content-Type" : "application/json"},
          data: JSON.stringify({"zendesk_user_id":this.zdUserId,"access_token":this.accessTokenValue})
        };
      }
    },      

    onActivate: function () {
      console.info("onActivate()");
      this.switchTo('initial');
      this.getTicketInfo();
      this.accessToken();
    },

    onDeactivate: function () {
        console.info("onDeactivate()");
        if (this.timer) {
            clearTimeout(this.timer);
        }
    },

    populateProjects: function (){
        this.ajax('getProjects')
            .done(function (data) {
                console.info(data);
                for (var key in data)
                {
                   if (data.hasOwnProperty(key))
                   {
                      // here you have access to
                      this.$('#prjId')
                        .append(this.$("<option></option>")
                        .attr("value",data[key].id)
                        .text(data[key].name)); 
                      console.log(data[key].name);
                   }
                }
            })
            .fail(function(){
                this.switchTo('initial');
            }); 

    },

    populateAssignedTo: function (user_id){
        var userName;
        this.CurUserIdForDropdown = user_id;
        this.ajax('getMemberDetails')
            .done(function (data) {

                    userName = data.first_name + ' ' + data.last_name;
                    this.$('#assignedToId')
                        .append(this.$("<option></option>")
                                .attr("value",user_id)
                                .text(userName));

                    //this.mdArray[this.arrCounter]=new Array(2);
                    //this.mdArray[this.arrCounter][0]=user_id;
                    //this.mdArray[this.arrCounter][1]=userName;
                    
                }); 
    },

/*
    onLogInOutClick: function (event) {
        if (this.accessToken()) {
            this.logout(event);
        } else {
            this.login(event);
        }
    },

*/
    getTicketInfo: function() {
      var ticket = this.ticket();    // Get the ticket object and assign it to a variable
      this.zdTicketId = ticket.id();
      this.rbTaskName = '#Zendesk ' + ticket.subject();
      this.rbTaskdescription = 'https://redbooth.zendesk.com/agent/#/tickets/' + ticket.id() + '</br>' + ticket.description();
      console.log('The ticket is ' + ticket.id());
    },

    setTicketInfo: function(data) {
      //ticket.customField("custom_field_11000", "yes");
      //var comment = this.comment();
      //this.zdTicketComment =  'Task successfully created in Redbooth: Project Id: ' + data.project_id + ' Tasklist Id: ' + data.task_list_id + ' Task Id: ' + data.id + ' Redbooth Task URL: https://redbooth.com/a/#!/projects/' + data.project_id + '/tasks/' + data.id;
      this.rbTaskId = '';
      this.rbTaskId = data.id;
      this.zdTicketComment =  'Task successfully created in Redbooth. \r \n Redbooth Task URL: https://redbooth.com/a/#!/projects/' + data.project_id + '/tasks/' + data.id;
      this.$('#divTaskCreated').html("https://redbooth.com/a/#!/projects/" + data.project_id + "/tasks/" + data.id);
    },    

    login: function (event) {
        console.info("login()");
        event.preventDefault();
        var popup = this.createLoginPopup();
        this.awaitAccessToken(popup);
    },

    logout: function (event) {
        console.info("logout()");
        event.preventDefault();
        this.accessToken(null);
        console.info("  access_token = " + this.accessToken());
        this.$('.loginout').text('Connect your Redbooth Account');
    },

    createLoginPopup: function () {
alert("this is login");
        console.info("createLoginPopup()");
        return window.open('https://redbooth.com/oauth2/authorize?response_type=token&client_id=' + this.redboothClientId + '&redirect_uri=https://' + this.zenDeskSubdomain + '.zendesk.com/agent&scope=all','Login Popup','width=400,height=400');
    },

    timer: null,

    awaitAccessToken: function (popup) {
        console.info("awaitAccessToken()");
        if (this.isLoaded(popup)) {
            console.info("  popup is loaded");
        } else {
            console.info("  popup is NOT loaded; sleeping");
            var t = this;
            this.timer = setTimeout(
                function () { t.awaitAccessToken(popup); },
                1000);
            return;
        }

        var access_token = this.parseAccessToken(popup.location.href);

        if (access_token) {
            console.info('  access_token = ' + access_token);
            popup.close();
            this.accessToken(access_token);
        } else {
            services.notify('Error requesting code...');
        }
    },

    isLoaded: function (win) {
        try {
            return ('about:blank' !== win.location.href) && (null !== win.document.body.innerHTML);
        } catch (err) {
            return false;
        }
    },

    parseAccessToken: function (uri) {
        var match = uri.match(/[#&]access_token=([^&]*)/i);
        return match[1] || null;
    },

    accessToken: function (value) {
        this.zdUserId = this.currentUser().id();
        if (1 === arguments.length) {
            console.info("Storing access_token = " + value);
            this.store({ access_token: value });
            this.accessTokenValue = value;
            this.ajax('storeAccessToken')
            .done(function (data) {
                    console.log (data);
                }); 
        }

        var token = this.store('access_token');
        this.accessTokenValue = token;
        console.info("access_token = " + token);

        //var loginout = this.$('.loginout');
        var currentAccount = this.currentAccount();
        console.log ('Subdomain: ' + currentAccount.subdomain());

        this.ajax('getZendeskTicket')
            .done(function (data) {
                console.log('ticket info: ' + data);
                });         

        if (token) {
            var ticket = this.ticket();
            if (ticket.customField("11000")) {
                this.switchTo('taskupdate');
            } else {
                this.switchTo('loggedin');
                this.populateProjects();
                //loginout.text('Disconnect your Redbooth Account');
            }
        } else {
            this.switchTo('initial');
            //loginout.text('Connect your Redbooth Account');
        }

        return token;
    }         

  };

}(this));