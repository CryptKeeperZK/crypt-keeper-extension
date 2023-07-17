#!/bin/bash
#
# Clone zkeys (params) from js-rln
#

js_rln_version=d77370f
js_rln_repo='js-rln'
js_rln_repo_url="https://github.com/waku-org/$js_rln_repo.git"


# Go to project root
cd `dirname $0`/..

target_zkeyfiles_dir="./zkeyFiles/js-rln"
target_rln_wasm_path="$target_zkeyfiles_dir/rln.wasm"
target_rln_zkey_path="$target_zkeyfiles_dir/rln_final.zkey"
target_rln_verifiation_key_path="$target_zkeyfiles_dir/verification_key.json"

# Build params if any of them does not exist
if [[ -f $target_rln_wasm_path ]] && [[ -f $target_rln_zkey_path ]] && [[ -f $target_rln_verifiation_key_path ]]; then
    echo "All params exist. Don't need to clone them"
    exit 0;
fi

# Clone js-rln in project root and checkout to the right version
git clone $js_rln_repo_url $js_rln_repo
cd $js_rln_repo
git checkout $js_rln_version
cd ..

js_rln_zkeys_relative_path="$js_rln_repo/src/resources"
js_rln_zkeys_verification_js="$js_rln_zkeys_relative_path/verification_key.js"
js_rln_zkeys_verification_json="$js_rln_zkeys_relative_path/verification_key.json"
# Change js to json format in place
sed -i.bak -e "s/const verificationKey = {/{/" -e "/export default verificationKey/d" $js_rln_zkeys_verification_js
mv $js_rln_zkeys_verification_js $js_rln_zkeys_verification_json

# Copy the clone & converted params to the zkeyFiles folder
mkdir -p $target_zkeyfiles_dir
cp $js_rln_zkeys_relative_path/* $target_zkeyfiles_dir
ls -al $target_zkeyfiles_dir

# Remove the js-rln repo
rm -rf $js_rln_repo

