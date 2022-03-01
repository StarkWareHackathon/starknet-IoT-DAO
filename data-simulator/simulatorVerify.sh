#!/bin/bash

. ./data-simulator/pebble-firmware-blockchain.sh
# version
VER="v1.04"

TargetMax=40
TargetMin=10

# default mode
default_mode="random"

# default mqtt publish topic
device_id="$(openssl rand -hex 100 | tr -dc '[:digit:]'|head -c15)"

GPS=(3158.4608072 11848.3730705)
gps_mode=$default_mode

accel=(-38 166 0)
accel_mode=$default_mode

vel = (23 32 0)
vel_mode = $default_mode

START=1626635631
DELTA=259200

RANDOM_MAX_INT=32768

STEP=10

CountPkg=12

genFile="$(pwd)/pebble.dat"

dataFile="$(pwd)/src/tempData/data.json"

getTime()
{
	current=`date "+%Y-%m-%d %H:%M:%S"`
	timeStamp=`date -d "$current" +%s`
	# ms
	currentTimeStamp=$(( timeStamp*1000+`date "+%N"`/1000000 ))
	echo $currentTimeStamp
}

SetMode()
{
     local  mode_sel=( "fixed" "random" "linear" )
     printf '\033\143'
     echo " 1. fixed"
     echo " 2. random"
     echo " 3. linear"
     read -n 1 key
     case $1 in
     1)
       gps_mode=${mode_sel[$key]}
	;;
     2)
       accel_mode=${mode_sel[$key]}
	;;
     3)
       vel_mode=${mode_sel[$key]}
	;;
     4)
       timestp_mode=${mode_sel[$key]}
	;;
     esac
     if [ $key == "1" ];then
     case $1 in
     1)
       echo "Please input a value for GPS ending with enter (e.g., 60.500525 13.886719):"
       read str
       GPS[0]=$(echo $str|awk '{print  $1 }')
       GPS[1]=$(echo $str|awk '{print  $2 }')
	;;
     2)
       echo "Please input a value for accelerometer ending with enter (e.g., -38 166 8270):"
       read str
       accel_mode[0]=$(echo $str|awk '{print  $1 }')
       accel_mode[1]=$(echo $str|awk '{print  $2 }')
       accel_mode[2]=$(echo $str|awk '{print  $3 }')
	;;
      3)
       echo "Please input a value for velocity ending with enter (e.g., -38 166 8270):"
       read str
       vel_mode[0]=$(echo $str|awk '{print  $1 }')
       vel_mode[1]=$(echo $str|awk '{print  $2 }')
       vel_mode[2]=$(echo $str|awk '{print  $3 }')
	;;
     esac
     fi
}


RandomInt()
{
  local min=$1
  local max=$2
  local random=$( echo "${min}+${RANDOM}/${RANDOM_MAX_INT}*(${max}-${min}+1)" | bc -l )
  echo -n ${random%.*}
}
RandomFloat()
{

  local precision=$1
  local scale=$2
  local max_int=$3
  local random=$( echo "${RANDOM}/${RANDOM_MAX_INT}*(${max_int}^${precision}) + ${RANDOM}/${RANDOM_MAX_INT} " | bc -l )
  LC_NUMERIC="en_US.UTF-8" printf "%.${scale}f" ${random}

}

NextData()
{
     # GPS
     if [ $gps_mode == "random" ];then
         gps_m=$( RandomFloat 1 7 60 )
         gps_g=$( RandomInt 0 90 )
         let gps_g=gps_g*100
         GPS[0]=$(echo $gps_g+$gps_m |bc -l)
         gps_m=$( RandomFloat 1 7 60 )
	 gps_g=$( RandomInt 0 180 )
	 let gps_g=gps_g*100
         GPS[1]=$(echo $gps_g+$gps_m |bc -l)
     elif [ $snr_mode == "linear" ];then
         GPS[0] = $(echo ${GPS[0]} + 2.1000|bc -l)
         GPS[1] = $(echo ${GPS[1]} + 2.1000|bc -l)
         if [ ${GPS[0]} > 9060 ];then
             GPS[0]=1032.14545
         fi
         if [ ${GPS[1]} > 18060 ];then
             GPS[1]=10030.14545
         fi
     fi
     # accelerometer
      if [ $accel_mode == "random" ];then
         accel[0]=$( RandomInt 0 5000 )
         accel[1]=$( RandomInt 0 5000 )
         accel[2]= 0
         flg=$( RandomInt 1 3 )
         let flg=flg-1
      elif [ $accel_mode == "linear" ];then
         accel[0]=$(${accel[0]} + 20|bc -l)
         accel[1]=$(${accel[1]} + 20|bc -l)
         accel[2]=$(${accel[2]} + 20|bc -l)
         if [ ${accel[0]} > 5000 ];then
             accel[0]=-10
         fi
         if [ ${accel[1]} > 5000 ];then
             accel[1]=-12
         fi
         if [ ${accel[2]} > 5000 ];then
             accel[2]=500
         fi
      fi
      #velocity
      if [ $vel_mode == "random" ];then
         vel[0]=$( RandomInt 0 50 )
         vel[1]=$( RandomInt 0 50 )
         vel[2]= 0
      elif [ $vel_mode == "linear" ];then
         vel[0]=$(${vel[0]} + 20|bc -l)
         vel[1]=$(${vel[1]} + 20|bc -l)
         vel[2]= 0
      fi
      
      let timestp=timestp+$DELTA
}

GenerateFile()
{
    if [ -a $genFile ];then
    	rm $genFile
    fi
    privKey=$(cat ./data-simulator/privKeyVerify)
    for((integer = 1; integer <= $CountPkg; integer++))
    do
	NextData
        objMessage="\"message\":{\"latitude\":${GPS[0]},\"longitude\":${GPS[1]},\"accelerometer\":[${accel[0]},${accel[1]},${accel[2]}],\"velocity\":[${vel[0]},${vel[1]},${vel[2]}],\"timestamp\":\"$timestp\"}"
        sign_msg="{$objMessage}"
        #if [ $OSTYPE == "Linux" ];then
        ecc_str=$( ./data-simulator/sign_linux  $privKey $sign_msg)      
        sign_r=$(echo ${ecc_str:2:64})
        sign_s=$(echo ${ecc_str:66:64})
        echo "{$objMessage,\"signature\":{\"r\":\"$sign_r\",\"s\":\"$sign_s\"}}" >> $genFile
    done

}

SetPebbleId()
{ 	
    while true
    do
        printf '\033\143'
	    read -p "Input 15 digits or enter to use the default value : " key
        [ ${#key} != 15 ] && [ ${#key} != 0 ] && echo "" && echo "The input is incorrect, please re-enter" && sleep 2 && continue
        [ ${#key} != 0  ] && device_id=$key 
        break
    done 
}

update_key_pair()
{
    printf '\033\143'
    #echo "The original key pair will be deleted. Are you sure to generate a new key pair (N/Y)?"
    #echo ""   
    #read -n 1 key
    #if [ "$key" != "Y" ];then
    #    return
    #fi
    #echo ""
    if [ -a "./data-simulator/tracker01.key" ];then
    	rm "./data-simulator/tracker01.key"
        echo "here"
    fi  
    openssl ecparam -name secp256k1 -genkey -out  ./data-simulator/tracker01.key 2>&1 1>/dev/null
    key_str=$(openssl ec -in ./data-simulator/tracker01.key -text -noout)
    priv_key=$(echo $key_str|awk '{print $5$6$7 }'|sed 's/://g') 
    pub_key=$(echo $key_str|awk '{print $9$10$11$12$13}'|sed 's/://g') 
    echo ${priv_key:0-64} > ./data-simulator/privKey
    echo $pub_key  > ./data-simulator/pubKey_uncompressed
    key_str=$(openssl ec -in ./data-simulator/tracker01.key -pubout  -text -noout -conv_form compressed)
    pub_key=$(echo $key_str|awk '{print $9$10$11}'|sed 's/://g') 
    echo $pub_key  > ./data-simulator/pubKey_compressed    
    return 1    
}

isInstalled()
{
    toolpath=$(which $1)
    [ -n "${toolpath}" ] && return 1
    return 0
}

envCheck()
{
    isInstalled  openssl
    ret=$?
    if [ $ret -eq 0 ]; then
        echo ""
        echo "Openssl is not installed, please install the openssl package"
        echo ""
        exit
    fi    
}

main()
{    
    #RSAInit
    timestp=$START    
    
    update_key_pair
    GenerateFile
}

envCheck
main

#clear backends
ExitClrAll