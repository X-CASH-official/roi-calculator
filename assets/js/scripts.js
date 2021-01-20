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
            if(amountValue.includes("k") || amountValue.includes("K")){
                myVoteAmount = (amountValue.replace(/["kK"]/,"") * 1000);
            } else if(amountValue.includes("m") || amountValue.includes("M")){
                myVoteAmount = (amountValue.replace(/["mM"]/,"") * 1000000);
            } else {
                myVoteAmount = (amountValue * 1);
            }

            populateTable();
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
                if(field.shared_delegate_status == "shared" || field.shared_delegate_status == "group") {

                    var totalRewardFeeAmount    = (totalRewardAmount * field.delegate_fee / 100);
                    var totalRewardToDistribute = (totalRewardAmount - totalRewardFeeAmount);
                    var totalVotes              = ((field.total_vote_count / 1000000) + myVoteAmount); // Actual votes + voted amount
                    var myVoteReturnPct         = ((myVoteAmount * 100) / totalVotes);
                    var myVoteReturnAmount      = ((myVoteReturnPct * totalRewardToDistribute) / 100);
                    var myVoteReturnROIPct      = ((myVoteReturnAmount * 100) / myVoteAmount);

                    var fields = [
                        "",
                        (i + 1),
                        '<a class="delegate_link tip" href="http://delegates.xcash.foundation/delegates/delegate_statistics?data='+ field.delegate_name +'" aria-label="Visit '+ field.delegate_name +'" title="Visit '+ field.delegate_name +'">' + field.delegate_name.slice(0, 45) + '</a>',
                        (field.shared_delegate_status == 'Solo') ? '<span class="material-icons">person_outline</span>' : ((field.shared_delegate_status == 'Shared') ? '<span class="material-icons">groups</span>' : '<span class="material-icons">lock</span>'),
                        (field.online_status == 'true') ? '<span class="material-icons Online">online_prediction</span>' : '<span class="material-icons Offline">highlight_off</span>',
                        (field.delegate_fee) ? field.delegate_fee+'%' : 'N/A',
                        (field.delegate_fee) ?  totalRewardFeeAmount.toLocaleString() : 'N/A',
                        (field.total_vote_count / 1000000).toLocaleString(),
                        field.block_verifier_online_percentage+"%",
                        myVoteReturnPct.toFixed(2)+'%',
                        myVoteReturnROIPct.toFixed(2)+'%',
                        myVoteReturnAmount.toLocaleString()
                    ];

                    delegateDataSet.push(fields);
                };
            });

            var table = $('#delegatesTable').DataTable({
                destroy: true,
                "bScrollCollapse": false,
                "bPaginate": false,
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
                    { title: "Rank", responsivePriority: 1 },
                    { title: "Delegate Name", responsivePriority: 2 },
                    { title: "Mode" },
                    { title: "Status" },
                    { title: "Fee %" },
                    { title: "Fee XCA" },
                    { title: "Votes" },
                    { title: "Online" },
                    { title: "Weight %"},
                    { title: "ROI %", responsivePriority: 3 },
                    { title: "ROI XCA" },
                ]
            });
        });
    });
}
