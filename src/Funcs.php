<?php

function GetDelegates($amount, $days){
    $dataURL = "http://delegates.xcash.foundation/getdelegates";

    if (stripos($amount, 'k') !== false) {
        $amount = (str_ireplace("k", "", $amount) * 1000);
    } else if(stripos($amount, 'm') !== false) {
        $amount = (str_ireplace("m", "", $amount) * 1000000);
    } else {
        $amount = ($amount * 1);
    }

    $data   = GetData($dataURL);
    $return = [];
    $i      = 0;
    $j	= 0;

    if(is_array($data)){
        $blockData                      = GetBlockData();
        if($blockData){
            foreach($data as $r){
                $j++;
                if($r['shared_delegate_status'] == "shared" || $r['shared_delegate_status'] == "group"){
                    $return[$i]	= Populate($days, $amount, $j, $r, $blockData);
                    $i++;
                }
            }
        } else {
            $return['error']        = true;
            $return['message']      = "Unable to fetch block data, try again later.";
        }
    } else {
        $return['error']        = true;
        $return['message']      = "Unable to fetch statistics data, try again later.";
    }

    echo json_encode($return, JSON_PRETTY_PRINT);
}

function GetDelegate($name, $amount, $days){
    $dataURL  = "http://delegates.xcash.foundation/getdelegatesstatistics?parameter1=".$name;

    $totalBlocksPerDay = 288;
    $totalBlockVerifiers = 45;

    if (stripos($amount, 'k') !== false) {
        $amount = (str_ireplace("k", "", $amount) * 1000);
    } else if(stripos($amount, 'm') !== false) {
        $amount = (str_ireplace("m", "", $amount) * 1000000);
    } else {
        $amount = ($amount * 1);
    }

    $data   = GetData($dataURL);

    if(is_array($data)){
        if(!isset($data['Error'])){
            $blockData	= GetBlockData();
            if($blockData){
                $return = Populate($days, $amount, intval($data['current_delegate_rank']), $data, $blockData);
            } else {
                $return['error']	= true;
                $return['message']	= "Unable to fetch block data, try again later.";
            }
        } else {
            $return['error']        = true;
            $return['message']      = "Delegate name ".$name." not found.";
        }
    } else {
        $return['error']        = true;
        $return['message']      = "Unable to fetch statistics data, try again later.";

    }

    echo json_encode($return, JSON_PRETTY_PRINT);
}

function Populate($days, $amount, $rank, $data, $blockData){
    $totalRewardAmount              = ($blockData['daily_reward'] * $days);
    $totalRewardFeeAmount           = ($totalRewardAmount * intval($data['delegate_fee']) / 100);
    $totalRewardToDistribute        = ($totalRewardAmount - $totalRewardFeeAmount);
    $totalVotes                     = ((intval($data['total_vote_count']) / 1000000) + $amount);
    $myVoteReturnPct                = (($amount * 100) / $totalVotes);
    $myVoteReturnAmount             = (($myVoteReturnPct * $totalRewardToDistribute) / 100);
    $myVoteReturnROIPct             = (($myVoteReturnAmount * 100) / $amount);

    $return                         = [];
    $return['rank']                 = $rank;
    $return['type']                 = $data['shared_delegate_status'];
    $return['delegate_name']        = $data['delegate_name'];
    $return['status']               = $data['online_status'];
    $return['fee']['pct']           = intval($data['delegate_fee']);
    $return['fee']['xcash']         = ($totalRewardAmount * intval($data['delegate_fee']) / 100);
    $return['votes']                = ($data['total_vote_count'] / 1000000);
    $return['online_pct']           = intval($data['block_verifier_online_percentage']);
    $return['weight_pct']           = round($myVoteReturnPct, 2);
    $return['roi']['pct']           = round($myVoteReturnROIPct, 2);
    $return['roi']['xcash']         = round($myVoteReturnAmount, 2);

    return $return;
}

function GetData($url){
    $headers        = [];
    $headers[]      = 'Accept: application/json';
    $headers[]      = 'Content-Type: application/json';
    $headers[]      = 'User-Agent: xcash/api';

    $ch             = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_URL, $url);

    $response       = curl_exec($ch);
    return json_decode($response, true);

}

function GetBlockData(){
    $lastBlockDataURL = "https://explorer.x-cash.org/getlastblockdata";

    $headers        = [];
    $headers[]      = 'Accept: application/json';
    $headers[]      = 'Content-Type: application/json';
    $headers[]      = 'User-Agent: xcash/api';

    $ch             = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_URL, $lastBlockDataURL);

    $response       = curl_exec($ch);
    $response	= json_decode($response, true);

    if(is_array($response)){
        $return = [];

        $dailyBlocks		= (288 / 45);
        $blockReward		= ($response['block_height'] < 800000) ? ($response['block_reward'] * 2) : $response['block_reward'];

        $return['block_height']	= $response['block_height'];
        $return['daily_blocks']	= $dailyBlocks;
        $return['block_reward']	= $blockReward;
        $return['daily_reward']	= ($blockReward * $dailyBlocks);

        return $return;
    } else {
        return false;
    }
}

?>
