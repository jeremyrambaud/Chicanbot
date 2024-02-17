#!/usr/bin/env bash

# Renders a text based list of options that can be selected by the
# user using up, down and enter keys and returns the chosen option.
#
#   Arguments   : list of options, maximum of 256
#                 "opt1" "opt2" ...
#   Return value: selected index (0 for opt1, 1 for opt2 ...)
function select_option {

    # little helpers for terminal print control and key input
    ESC=$( printf "\033")
    cursor_blink_on()  { printf "$ESC[?25h"; }
    cursor_blink_off() { printf "$ESC[?25l"; }
    cursor_to()        { printf "$ESC[$1;${2:-1}H"; }
    print_option()     { printf "   $1 "; }
    print_selected()   { printf "  $ESC[7m $1 $ESC[27m"; }
    get_cursor_row()   { IFS=';' read -sdR -p $'\E[6n' ROW COL; echo ${ROW#*[}; }
    key_input()        { read -s -n3 key 2>/dev/null >&2
                         if [[ $key = $ESC[A ]]; then echo up;    fi
                         if [[ $key = $ESC[B ]]; then echo down;  fi
                         if [[ $key = ""     ]]; then echo enter; fi; }

    # initially print empty new lines (scroll down if at bottom of screen)
    for opt; do printf "\n"; done

    # determine current screen position for overwriting the options
    local lastrow=`get_cursor_row`
    local startrow=$(($lastrow - $#))

    # ensure cursor and input echoing back on upon a ctrl+c during read -s
    trap "cursor_blink_on; stty echo; printf '\n'; exit" 2
    cursor_blink_off

    local selected=0
    while true; do
        # print options by overwriting the last lines
        local idx=0
        for opt; do
            cursor_to $(($startrow + $idx))
            if [ $idx -eq $selected ]; then
                print_selected "$opt"
            else
                print_option "$opt"
            fi
            ((idx++))
        done

        # user key control
        case `key_input` in
            enter) break;;
            up)    ((selected--));
                   if [ $selected -lt 0 ]; then selected=$(($# - 1)); fi;;
            down)  ((selected++));
                   if [ $selected -ge $# ]; then selected=0; fi;;
        esac
    done

    # cursor position back to normal
    cursor_to $lastrow
    printf "\n"
    cursor_blink_on

    return $selected
}

function select_opt {
    select_option "$@" 1>&2
    local result=$?
    echo $result
    return $result
}

function bumpVersion {
    printf "Building projet...\n"
    docker run --rm -v "$PWD":/usr/src/app/ -w /usr/src/app node:lts yarn install && yarn run build
    printf "Done.\n\n"

    if [ $# -eq 0 ]
    then
        version=$(grep '"version"' package.json | cut -d '"' -f 4 | head -n 1)
        printf "Keeping version: $version.\n\n"
    else
        printf "Bumping $1 version...\n"
        docker run --rm -v "$PWD":/usr/src/app/ -w /usr/src/app node:lts npm version $1 --git-tag-version=false > /dev/null
        version=$(grep '"version"' package.json | cut -d '"' -f 4 | head -n 1)
        printf "Done, new version: $version.\n\n"
    fi

    printf "Building docker-image jrambaud/chicanbot:$version...\n"
    docker build --pull --rm -f "Dockerfile" -t jrambaud/chicanbot:$version -t jrambaud/chicanbot:latest "."
    printf "Done.\n\n"

    printf "Do you want to push the docker image ?\n"
    case `select_opt "Yes" "No"` in
        0) docker push jrambaud/chicanbot --all-tags;;
        1) ;;
    esac
    printf "\nAll done !"
}

printf "Which version would you like to bump ?\n"

case `select_opt "Major (X.0.0)" "Minor (0.X.0)" "Patch (0.0.X)" "Keep current version" "Cancel"` in
    0) bumpVersion "major";;
    1) bumpVersion "minor";;
    2) bumpVersion "patch";;
    3) bumpVersion;;
    4) exit 0;
esac
