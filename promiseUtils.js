'use strict';

module.exports = {
    allSettled: allSettled
};

function allSettled (tasks) {
    const passed = [];
    const failed = [];
    const errors = [];

    if (!Array.isArray(tasks)) {
        return Promise.reject(
            new Error(
              'allSettled expects an array of task functions as the first argument'
            )
        );
    }

    tasks = Object.assign([], tasks);

    function next () {
        var task = tasks.shift();

        if (!task) {
            // we're at the end
            return Promise.resolve({
                passed: passed,
                failed: failed,
                errors: errors
            });
        }

        return task.then(result => {
            result.passed.forEach(test => { passed.push(test); });
            result.failed.forEach(test => { failed.push(test); });
            result.errors.forEach(test => { errors.push(test); });
        }).catch(err => {
            errors.push(err);
            return Promise.resolve();
        }).then(next);
    }

    return next();
}
