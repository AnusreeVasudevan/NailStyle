(async function ($) {
    "use strict";

    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        const res = await fetch('/admin/monthly',{
            method:'post'
        })

        const {yValues , xValues} = await res.json();
        let chart=dailyFn(ctx,yValues,xValues)

        const selectionElement = document.getElementById('selection');

        selectionElement.addEventListener('change', async function () {
            const option = this.value;

            if (chart) {
                chart.destroy();
            }

            if (option === 'Daily') {
                const res = await fetch('/admin/daily', {
                    method: 'post'
                });
                const {yValues, xValues} = await res.json();
                chart = await dailyFn(ctx, yValues, xValues); // Await chart creation
            } else if (option === 'Monthly') {
                const res = await fetch('/admin/monthly', {
                    method: 'post'
                });
                const {yValues, xValues} = await res.json();
                chart = await monthlyFn(ctx, yValues, xValues); // Await chart creation
            }
        });
    }})(jQuery);

        function monthlyFn(ctx, yValues, xValues){
            return new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',
                
                // The data for our dataset
                data: {
                    labels: [...xValues],
                    datasets: [{
                            label: 'Sales',
                            tension: 0.3,
                            fill: true,
                            backgroundColor: 'rgba(44, 120, 220, 0.2)',
                            borderColor: 'rgba(44, 120, 220)',
                            data: [...yValues]
                        },
                        
    
                    ]
                },
                options: {
                    plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                    }
                }
            });
        } 
    
    


    function dailyFn(ctx, yValues, xValues){
        return new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels: [...xValues],
                datasets: [{
                        label: 'Sales',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: [...yValues]
                    },
                    

                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } 