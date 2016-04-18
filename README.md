# nodehook
This is a node software to make it quicker to make simple applications.

The modules require a format that allows for an object orientated way or programming. 

There are 3 things the modules require:
 - A table that defines the module and requirements. (Specifically exports.module, see example.js for reference.)
 - A pre-initialization function, this allows to setup things for going live. (exports.module.preinit)
 - A initialization function, which is run to go live. (exports.module.init)
