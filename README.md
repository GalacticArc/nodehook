# nodehook
This is a node software to make it quicker to make simple applications.

The modules require a format that allows for an object orientated way or programming. 

There are 4 things the modules can have:
 - (Required) A table that defines the module and requirements. (Specifically exports.module, see example.js for reference.)
 - A pre-initialization function, this allows to setup things for going live. (exports.module.preinit)
 - A initialization function, which is run to go live. (exports.module.init)
 - A close function which will run when the process needs to shutdown properly. Does not get called when the process is killed.
