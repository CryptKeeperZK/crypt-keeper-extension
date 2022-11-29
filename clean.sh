# Temporary clean sccript for replacing eval() code from the backgroud script
VAR="exports.promiseImpl = (new Function('return this;'))().Promise;"
VAR2="exports.promiseImpl = (function() { return this ? this : typeof self !== 'undefined' ? self : undefined})() || Function('return this')();"

sed -i -e "s/${VAR}/${VAR2}/g"  