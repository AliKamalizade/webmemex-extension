import React from 'react'
import { Button, Icon, Modal, Header, ModalContent, ModalActions } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import WordCloud from 'wordcloud'

// A dialog for citations
class StorageStatisticsModal extends React.Component {
    constructor(props) {
        super(props)
        this.pageTitle = document.title
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.customMetadata = {} // contains references to custom metadata input fields
        this.customMetadataValues = {}
        this.defaultMetadata = {}
        // this.pageId = this.props.page._id
        this.state = { modalOpen: false }
    }

    // Reinsert custom metadata when shown again
    componentDidUpdate (prevProps, prevState) {
        if (this.state.modalOpen) {
            const list = []
            for (const key of Object.keys(this.props.customMetadata)) {
                if (key.indexOf('page/') !== -1) {
                    let obj = this.props.customMetadata[key].defaultMetadata
                    try {
                        Object.keys(obj).forEach((defaultMetadataKey) => {
                            list.push([obj[defaultMetadataKey].slice(0, 50), 12])
                        })
                    } catch (e) {
                        console.log(e)
                    }
                    obj = this.props.customMetadata[key].customMetadata
                    try {
                        Object.keys(obj).forEach((customMetadataKey) => {
                            list.push([obj[customMetadataKey].slice(0, 50), 12])
                        })
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
            // ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
            try {
                WordCloud(document.getElementById('storage-statistics'), {list: list, drawOutOfBound: true, gridSize: 16, weightFactor: 1.2})
            } catch (e) {
                console.log(e)
            }
        }
    }

    // Function to download metadata as a .txt file
    exportAsFile() {
        try {
            const file = new Blob([JSON.stringify(this.props.customMetadata, null)], {type: 'text/plain'})
            const a = document.createElement('a')
            const url = URL.createObjectURL(file)
            a.href = url
            a.download = 'WebMemex-Export-Metadata.txt'
            document.body.appendChild(a)
            a.click()
            setTimeout(function () {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }, 0)
        } catch (e) {
            console.log(e)
        }
    }

    // Create custom metadata list. Each entry consists of a label for a custom type of metadata and of its value
    // getCustomMetadataList() {
    //     const result = [...new Array(this.state.numberOfCustomMetadata)].map((el, i) =>
    //         <li key={i}>
    //
    //         </li>
    //     )
    //     return <ul style={{ listStyle: 'none', paddingLeft: 0 }}>{result}</ul>
    // }

    // Open modal, change tab title. Obtain stored metadata and insert it, else insert default
    handleModalOpen() {
        this.setState({modalOpen: true})
        document.title = 'Custom metadata statistics'
    }

    // Close modal, revert title and save edits in extension storage
    handleModalClose () {
        this.setState({modalOpen: false})
        document.title = this.pageTitle
    }

    render() {
        return <Modal
            closeIcon
            open={this.state.modalOpen}
            size={'fullscreen'}
            onClose={e => this.handleModalClose()}
            trigger={
                <Button
                    icon='bar graph'
                    id={'statistics'}
                    onClick={e => { e.preventDefault(); this.handleModalOpen() }}
                    floated='right'
                    tabIndex='-1'
                    title={'Show custom metadata statistics'}
                />
            }>
            <Header icon='bar graph' content='Custom metadata statistics' />
            <ModalContent scrolling>
                <div id={'storage-statistics'} style={{ padding: '20px', minHeight: '600px' }} />
            </ModalContent>
            <ModalActions>
                <Button color='red' negative onClick={e => this.handleModalClose()}>
                    <Icon name='remove' /> Close
                </Button>
                <Button color='green' title={'Save metadata as a .txt file'} onClick={e => this.exportAsFile()}>
                    <Icon name='bar graph' /> Export metadata
                </Button>
            </ModalActions>
        </Modal>
    }
}

StorageStatisticsModal.propTypes = {
    customMetadata: PropTypes.object,
}
export default StorageStatisticsModal
