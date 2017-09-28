import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Input } from 'semantic-ui-react'

import * as actions from '../actions'
import { ourState } from '../selectors'
import ResultList from './ResultList'
import DateSelection from './DateSelection'
import styles from './Overview.css'
import StorageStatisticsModal from "../../statistics/StorageStatisticsModal"


class Overview extends React.Component {
    constructor(props) {
        super(props)
        this.savedPages = null
        this.state = {}
        this.update = this.update.bind(this)
    }
    componentDidMount() {
        if (this.props.grabFocusOnMount) {
            this.inputQueryEl.focus()
        }
        this.waitForLocalStorage()
    }

    // get saved content from localstorage
    async waitForLocalStorage () {
        return browser.storage.local.get().then((savedPage) => {
            this.savedPages = savedPage
            return savedPage
        })
    }

    // trigger rerendering
    async update(updatedMetadata, pageId) {
        if(this.savedPages[pageId]) {
            this.savedPages[pageId].defaultMetadata = updatedMetadata
        }
        this.setState({})
    }

    render() {
        return (
            <div>
                <div
                    className={styles.queryInputContainer}
                >
                    <Input
                        size='huge'
                        icon='search'
                        iconPosition='left'
                        onChange={e => { this.props.onInputChanged(e.target.value) }}
                        onKeyDown={e => {
                            if (e.key === 'Escape') { this.props.onInputChanged('') }
                        }}
                        placeholder='Search your memory'
                        value={this.props.query}
                        ref={el => { this.inputQueryEl = el }}
                        className={styles.queryInputComponent}
                    />
                    <DateSelection
                        date={this.props.endDate}
                        onDateChange={this.props.onEndDateChange}
                    />
                    <StorageStatisticsModal customMetadata={this.savedPages} />
                </div>
                <div>
                    <ResultList
                        searchResult={this.props.searchResult}
                        searchQuery={this.props.query}
                        onBottomReached={this.props.onBottomReached}
                        waitingForResults={this.props.waitingForResults}
                        savedPage={this.savedPages}
                        parentCallbackToUpdateList={this.update}
                    />
                </div>
            </div>
        )
    }
}

Overview.propTypes = {
    grabFocusOnMount: PropTypes.bool,
    query: PropTypes.string,
    onInputChanged: PropTypes.func,
    endDate: PropTypes.number,
    onEndDateChange: PropTypes.func,
    onBottomReached: PropTypes.func,
    waitingForResults: PropTypes.bool,
    searchResult: PropTypes.object,
}


const mapStateToProps = state => {
    state = ourState(state)
    return {
        ...state.currentQueryParams,
        searchResult: state.searchResult,
        waitingForResults: !!state.waitingForResults, // cast to boolean
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({
    onInputChanged: actions.setQuery,
    onEndDateChange: actions.setEndDate,
    onBottomReached: actions.loadMoreResults,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Overview)
