$(document).ready(function() {
    delegatesDataURL = "http://delegates.xcash.foundation/getdelegates";
    lastBlockDataURL = "https://explorer.x-cash.org/getlastblockdata";

    totalBlocksPerDay = 288;
    totalBlockVerifiers = 45;

    myVoteAmount = 2000000;

    daysToCalculate = $("#days").val();
    populateTable();

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    $("#calculate").click(function(){
        amountValue = $("#amount").val();
        daysToCalculate = $("#days").val();
        if(amountValue == ""){
            toastr['error']('Amount to vote is empty!'); 
        } else {
            myVoteAmount = (amountValue.replace(/[kK]/,"000").replace(/[mM]/,"000000") * 1);
            populateTable()
        }
    });
});

function populateTable(){
    $.getJSON(lastBlockDataURL, function(blockData) {
        var dailyBlocks         = (totalBlocksPerDay / totalBlockVerifiers);
        var blockHeight         = (blockData.block_height * 1);
        var blockRewardAmount   = (blockData.block_reward * 1);
        var dailyRewardAmount   = (blockRewardAmount * dailyBlocks);

        if(blockHeight < 800000){
            blockRewardAmount = (blockRewardAmount * 2);
            dailyRewardAmount = (dailyRewardAmount * 2);
        }

        var totalRewardAmount       = (dailyRewardAmount * daysToCalculate);

        $.getJSON(delegatesDataURL, function(delegateData) {
            var delegateDataSet = [];
            $.each(delegateData, function(i, field) {
                if(field.shared_delegate_status == "shared") {

                    var totalRewardFeeAmount    = (totalRewardAmount * field.delegate_fee / 100);
                    var totalRewardToDistribute = (totalRewardAmount - totalRewardFeeAmount);
                    var totalVotes              = ((field.total_vote_count / 1000000) + myVoteAmount); // Actual votes + voted amount
                    var myVoteReturnPct         = ((myVoteAmount * 100) / totalVotes);
                    var myVoteReturnAmount      = ((myVoteReturnPct * totalRewardToDistribute) / 100);

                    var fields = [
                        "",
                        (i + 1),
                        field.delegate_name,
                        (field.online_status == "true") ? "Online" : "Offline",
                        (field.delegate_fee) ? field.delegate_fee+"% ("+totalRewardFeeAmount.toLocaleString()+" XCASH)" : "Not set",
                        (field.total_vote_count / 1000000).toLocaleString()+" XCASH",
                        field.block_verifier_online_percentage+"%",
                        myVoteReturnPct.toFixed(2)+"% ("+myVoteReturnAmount.toLocaleString()+" XCASH)"
                    ];

                    delegateDataSet.push(fields);
                };
            });

            var table = $('#delegatesTable').DataTable({
                destroy: true,
                responsive: {
                    details: {
                        type: 'column'
                    }
                },
                columnDefs: [{
                    className: 'dtr-control',
                    orderable: false,
                    targets:   0
                }],
                order: [ 1, 'asc' ],

                data: delegateDataSet,
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search..."
                },
                columns: [
                    { title: "" },
                    { title: "Rank" },
                    { title: "Delegate Name" },
                    { title: "Status" },
                    { title: "Fee" },
                    { title: "Votes" },
                    { title: "Online" },
                    { title: "Net ROI" }
                ]
            });
        });
    });
}
