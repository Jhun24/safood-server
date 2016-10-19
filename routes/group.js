module.exports = group;

function group(app, db, randomStr) {

    app.post('/group/searchGroup', function (req, res) {
        var params = ['query'];
        if (checkParams(req.body, params)) {
            db.UserGroup.find({groupname: req.body.query}, function (err, docs) {
                if (docs.length != 0) res.send(docs);
                else res.sendStatus(401);
            })
        } else res.sendStatus(403);
    });

    app.post('/group/getGroupInfo', function (req, res) {
        var params = ['groupid'];
        if (checkParams(req.body, params)) {
            db.UserGroup.find({groupid: req.body.groupid}, function (err, doc) {
                if (doc.length != 0) res.send(doc);
                else res.sendStatus(401);
            })
        } else res.sendStatus(403);
    });

    app.post('/group/joinGroup', function (req, res) {
        var params = ['apikey', 'groupid'];
        if (checkParams(req.body, params)) {
            db.UserGroup.findOne({groupid: req.body.groupid}, function (err, doc) {
                if (err) throw err;
                else if (doc != null) {
                    if (doc.members.indexOf(req.body.apikey) == -1) {
                        db.UserGroup.update({groupid: req.body.groupid},
                            {$push: {members: req.body.apikey}}, function (err, numAff) {
                                if (err) throw err;
                                else if (numAff == 0) res.sendStatus(401);
                                else res.sendStatus(200);
                            });
                    } else res.sendStatus(409);
                } else res.sendStatus(401);
            });
        } else res.sendStatus(403);
    });
    app.post('/group/leaveGroup', function (req, res) {
        var params = ['apikey', 'groupid'];
        if (checkParams(req.body, params)) {
            db.UserGroup.findOne({groupid: req.body.groupid}, function (err, doc) {
                if (err) throw err;
                else if (doc != null) {
                    if (doc.members.indexOf(req.body.apikey) > -1) {
                        db.UserGroup.update({groupid: req.body.groupid},
                            {pull: {members: req.body.apikey}}, function (err, numAff) {
                                if (err) throw err;
                                else if (numAff == 0) res.sendStatus(401);
                                else res.sendStatus(200);
                            });
                    } else res.sendStatus(409);
                } else res.sendStatus(401);
            });
        } else res.sendStatus(403);
    });

    app.post('/group/admin/checkGroupTag', function (req, res) {
        var params = ['grouptag'];
        if (checkParams(req.body, params)) {
            db.UserGroup.find({grouptag: req.body.grouptag}, function (err, docs) {
                if (docs.length != 0) res.sendStatus(200);
                else res.sendStatus(409);
            })
        } else res.sendStatus(403);
    });

    app.post('/group/admin/createGroup', function (req, res) {
        var params = ['groupname', 'grouptag', 'admin'];
        if (checkParams(req.body, params)) {
            db.UserGroup.find({grouptag: req.body.grouptag}, function (err, docs) {
                if (docs.length != 0) {
                    var newGroup = new db.UserGroup({
                        groupid: randomStr.generate(),
                        members: [
                            req.body.admin
                        ]
                    });
                    params.forEach(e => newGroup[e] = req.body[e]);
                    newGroup.save(function (err) {
                        if (err) throw err;
                    });
                    db.User.update({userid:req.body.admin}, {groupid:newGroup.groupid}, function(err, numAf){
                        if(err) throw err;
                        else res.status(200).send(newGroup);
                    });
                }
                else res.sendStatus(409);
            })
        } else res.sendStatus(403);
    });

    app.post('/group/admin/destroyGroup', function (req, res) {
        var params = ['userid', 'groupid'];
        if (checkParams(req.body, params)) {
            db.UserGroup.findOne({groupid: req.body.groupid}, function (err, doc) {
                if (doc != null) {
                    if (doc.admin == req.body.userid) {
                        db.UserGroup.remove({groupid: req.body.groupid}, function (err, numAF) {
                            if (err) throw err;
                            else {
                                db.User.update({groupid : req.body.groupid}, {groupid : ''}, function (err, numAF) {
                                    if(err) throw err;
                                    else res.sendStatus(200);
                                })
                            }
                        });
                    } else res.sendStatus(401);
                } else res.sendStatus(400);
            })
        }
    });
    app.post('/group/admin/modifyGroupInfo', function (req, res) {
        var params = ['userid', 'groupname', 'groupid', 'grouptag'];
        if (checkParams(req.body, params)) {
            db.UserGroup.findOne({groupid: req.body.groupid}, function (err, doc) {
                if (doc != null) {
                    if (doc.admin == req.body.userid) {
                        db.UserGroup.update({groupid: req.body.groupid},
                            {groupname: req.body.groupname, grouptag: req.body.grouptag}, function (err, numAF) {
                                if (err) throw err;
                                else res.sendStatus(200);
                            });
                    } else res.sendStatus(401);
                } else res.sendStatus(400);
            })
        }
    });
    app.post('/group/admin/addUser', function (req, res) {
        var params = ['userid', 'targetid', 'groupid'];
        if (checkParams(req.body, params)) {
            db.UserGroup.findOne({groupid: req.body.groupid}, function (err, doc) {
                if (doc != null) {
                    if (doc.admin == req.body.userid) {
                        if (doc.members.indexOf(req.body.targetid) == -1) {
                            db.UserGroup.update({groupid: req.body.groupid},
                                {$push: {members: req.body.targetid}}, function (err, numAF) {
                                    if (err) throw err;
                                    else res.sendStatus(200);
                                });
                        } else res.sendStatus(409);
                    } else res.sendStatus(401);
                } else res.sendStatus(400);
            })
        }
    });
    app.post('/group/admin/removeUser', function (req, res) {
        var params = ['userid', 'targetid', 'groupid'];
        if (checkParams(req.body, params)) {
            db.UserGroup.findOne({groupid: req.body.groupid}, function (err, doc) {
                if (doc != null) {
                    if (doc.admin == req.body.userid) {
                        if (doc.members.indexOf(req.body.targetid) > -1) {
                            db.UserGroup.update({groupid: req.body.groupid},
                                {$pull: {members: req.body.targetid}}, function (err, numAF) {
                                    if (err) throw err;
                                    else res.sendStatus(200);
                                });
                        } else res.sendStatus(409);
                    } else res.sendStatus(401);
                } else res.sendStatus(400);
            })
        }
    });
    function checkParams(body, params) {
        return params.every(str => body[str] != null);
    }
}