import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                     from './../common/jenkins-util';
import moment                          from 'moment';
import { default as BarChart }         from './charts/BarChart.jsx';

class PlatoComplexityAverageChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            history: []
        };
    }

    getApiRequest() {
        const { jobs, folder } = this.props;

        const folderApiURLpart = jenkinsUtil.fitApiURL(folder);

        return {
            id: `jenkins.platoComplexityAverage.${folder}`,
            params: {
                jobs: jobs,
                folder: folderApiURLpart,
            }
        };
    }

    onApiData(data) {
        console.log('ComplexityAvgH ', JSON.stringify(data));

        const newHistory = this.makeHistory(data);

        this.setState({
            history: newHistory
        });
    }

    makeHistory(entry) {
        const { history } = this.state;
        const historyLength = history.length;

        if(historyLength === 0) {
            let newHistory = [];
            newHistory.push(this.newHistoryItem(entry));
            return newHistory;
        } else if(history[historyLength-1].data !== entry) {
            let newHistory;

            if(historyLength < 5)
                newHistory = history.slice(0, historyLength);
            else
                newHistory = history.slice(1, historyLength);

            newHistory.push(this.newHistoryItem(entry));
            return newHistory;
        } else
            return history;
    }

    newHistoryItem(data) {
        const now = moment();
        const element = {
            data,
            timestamp: now
        };
        return element;
    }

    render() {
        const { title } = this.props;
        const { history } = this.state;

        // converts to format required by BarChart component
        const data = history.map(entry => ({
            x:      entry.timestamp.format('H:mm:ss;MMM D;YYYY'),
            y:      entry.data,
            change: entry.data > 0 ? 'success' : 'failure'  // may compare with previous value, decide color
        }));

        const barChartOptions = {
            mode:            'stacked',
            xLegend:         'date',
            xLegendPosition: 'right',
            yLegend:         'complexity',
            yLegendPosition: 'top',
            xPadding:        0.3,
            barClass:        d => `result--${ d.change }`
        };

        return (
            <div>
                <div className="widget__header">
                    {title}
                    <i className="fa fa-line-chart"/>
                </div>
                <div className="widget__body">
                    <BarChart data={[{ data: data }]} options={barChartOptions}/>
                </div>
            </div>
        );
    }
}

PlatoComplexityAverageChart.displayName = 'PlatoComplexityAverageChart';

PlatoComplexityAverageChart.propTypes = {
    jobs: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(PlatoComplexityAverageChart.prototype, ListenerMixin);
reactMixin(PlatoComplexityAverageChart.prototype, Mozaik.Mixin.ApiConsumer);


export default PlatoComplexityAverageChart;
