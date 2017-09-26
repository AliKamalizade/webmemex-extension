import React from 'react'
import { Button, Icon, Modal, Header, ModalContent, ModalActions, } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// A dialog for citations
class StorageStatisticsModal extends React.Component {
    constructor(props) {
        super(props)
        this.pageTitle = document.title
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.customMetadata = {} // contains references to custom metadata input fields
        this.customMetadataValues = {}
        this.defaultMetadata = {}
        this.pageId = this.props.page._id
        this.state = { modalOpen: false, metadata: {}, numberOfCustomMetadata: 0, customMetadata: {}, }
    }

    // Reinsert custom metadata when shown again
    componentDidUpdate (prevProps, prevState) {
        if (this.state.modalOpen && this.state.numberOfCustomMetadata > 0) {
            ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
        }
    }

    getCustomMetadataContainerDom() {
        return document.getElementById('custom-statistics-container')
    }

    // Create custom metadata list. Each entry consists of a label for a custom type of metadata and of its value
    getCustomMetadataList() {
        const result = [...new Array(this.state.numberOfCustomMetadata)].map((el, i) =>
            <li key={i}>

            </li>
        )
        return <ul style={{ listStyle: 'none', paddingLeft: 0 }}>{result}</ul>
    }

    // Open modal, change tab title. Obtain stored metadata and insert it, else insert default
    handleModalOpen() {
        this.setState({modalOpen: true})
        document.title = 'Storage statistics'
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
            onClose={e => this.handleModalClose()}
            trigger={
                <Button
                    icon='bar graph'
                    id={this.pageId + 'statistics'}
                    onClick={e => { e.preventDefault(); this.handleModalOpen() }}
                    floated='right'
                    tabIndex='-1'
                    title={'Show statistics'}
                />
            }>
            <Header icon='edit' content='Storage statistics' />
            <ModalContent scrolling>
                <div>
                    {this.pageTitle}
                </div>
            </ModalContent>
            <ModalActions>
                <Button color='red' negative onClick={e => this.handleModalClose()}>
                    <Icon name='remove' /> Close
                </Button>
                <Button color='green' title={''}>
                    <Icon name='quote left' /> Export metadata
                </Button>
            </ModalActions>
        </Modal>
    }
}

StorageStatisticsModal.propTypes = {
    page: PropTypes.object,
}
export default StorageStatisticsModal
