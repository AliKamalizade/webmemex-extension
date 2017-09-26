import React from 'react'
import { Button, Icon, Modal, Input, Header, ModalContent, ModalActions, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from './EditMetadataModel.css'

// A dialog which contains stored metadata. New metadata can be added.
class EditMetadataModal extends React.Component {
    constructor(props) {
        super(props)
        this.pageTitle = document.title
        this.state = { modalOpen: false, metadata: {}, numberOfCustomMetadata: 0, customMetadata: {} }
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.customMetadata = {} // contains references to custom metadata input fields
        this.customMetadataValues = {}
        this.defaultMetadata = {}
        this.pageId = this.props.page._id
    }

    // Reinsert custom metadata when shown again
    componentDidUpdate (prevProps, prevState) {
        if (this.state.modalOpen && this.state.numberOfCustomMetadata > 0) {
            ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
        }
    }

    // Add new metadata entry
    addNewMetadata(selectedText) {
        const count = this.state.numberOfCustomMetadata + 1
        ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
        this.setState({numberOfCustomMetadata: count, customMetadata: this.customMetadata})
        // if user has selected text and clicked context menu item: fill in selected text as value
        if (selectedText) {
            this.customMetadataValues[count - 1].inputRef.value = selectedText
            browser.storage.local.remove('selectedText')
            this.setState({numberOfCustomMetadata: count, customMetadata: this.customMetadata})
        }
        console.log(this.customMetadata)
        console.log(this.state)
    }

    getCustomMetadataContainerDom() {
        return document.getElementById('custom-metadata-container')
    }

    // Create custom metadata list. Each entry consists of a label for a custom type of metadata and of its value
    getCustomMetadataList() {
        const result = [...new Array(this.state.numberOfCustomMetadata)].map((el, i) =>
            <li key={i}>
                <Grid columns={2}>
                    <GridRow>
                        <GridColumn>
                            <Input
                                title={this.customMetadata[i]? this.customMetadata[i].inputRef.value : null}
                                placeholder={`New Metadata name`}
                                defaultValue={this.customMetadata[i]? this.customMetadata[i].inputRef.value : null}
                                ref={(input) => { this.customMetadata[i] = input }}
                            />
                        </GridColumn>
                        <GridColumn>
                            <Input
                                title={`New Metadata value`}
                                placeholder={`New Metadata value`}
                                defaultValue={this.customMetadataValues[i]? this.customMetadataValues[i].inputRef.value : null}
                                ref={(input) => { this.customMetadataValues[i] = input }}
                            />
                        </GridColumn>
                    </GridRow>
                </Grid>
            </li>
        )
        return <ul className={styles.cleanerListStyle}>{result}</ul>
    }

    // Called when an input is
    handleInputChange(e, identifier) {
        const metadata = this.state.metadata
        // Update item and store it
        metadata[identifier] = e.target.value
        this.setState({metadata: metadata})
        // console.log(e.target)
    }

    // Open modal, change tab title. Obtain stored metadata and insert it, else insert default
    handleModalOpen() {
        this.setState({modalOpen: true})
        document.title = 'Edit metadata'
        // this.getCitation('10.1145/641007.641053')
        if (Object.keys(this.state.metadata).length === 0) {
            // Insert default metadata from page object
            const defaultMetadata = {}
            defaultMetadata['Title'] = this.props.page.title
            defaultMetadata['Description'] = this.props.page.content ? this.props.page.content.description : null
            defaultMetadata['URL'] = this.props.page.url
            defaultMetadata['Keywords'] = this.props.page.content ? this.props.page.content.keywords : null
            if (this.pageId !== null) {
                // Get all the metadata from storage
                browser.storage.local.get(this.pageId).then((savedPage) => {
                    // Insert default user edited metadata from storage
                    if (savedPage[this.pageId]) {
                        const storedDefaultMetadata = Object.keys(savedPage[this.pageId].defaultMetadata)
                        const numberOfDefaultMetadata = storedDefaultMetadata.length
                        for (let i = 0; i < numberOfDefaultMetadata; i++) {
                            const key = storedDefaultMetadata[i]
                            defaultMetadata[key] = savedPage[this.pageId].defaultMetadata[key]
                        }
                        this.setState({metadata: defaultMetadata})
                        console.log(this.state)
                        // Insert custom metadata from storage
                        const storedCustomMetadata = Object.keys(savedPage[this.pageId].customMetadata)
                        const numberOfCustomMetadata = storedCustomMetadata.length
                        this.setState({numberOfCustomMetadata: numberOfCustomMetadata})
                        ReactDOM.render(this.getCustomMetadataList(), this.getCustomMetadataContainerDom())
                        for (let i = 0; i < numberOfCustomMetadata; i++) {
                            const key = storedCustomMetadata[i]
                            const value = savedPage[this.pageId].customMetadata[key]
                            this.customMetadata[i].inputRef.value = key
                            this.customMetadataValues[i].inputRef.value = value
                        }
                    }
                    console.log(this.customMetadata)
                    // console.log(savedPage[this.pageId])
                    this.setState({customMetadata: savedPage[this.pageId].customMetadata})
                })
            }
            this.setState({metadata: defaultMetadata})
        }
        // get selected text and add a new metadata item if not null
        browser.storage.local.get('selectedText').then(value => {
            if (Object.keys(value).length > 0) {
                this.addNewMetadata(value.selectedText)
                console.log(value)
            }
        })
    }

    // Close modal, revert title and save edits in extension storage
    handleModalClose (performSave = false) {
        this.setState({modalOpen: false})
        document.title = this.pageTitle
        if (performSave) {
            const customMetadataToStore = {}
            const numberOfCustomMetadata = Object.keys(this.customMetadata).length
            for (let i = 0; i < numberOfCustomMetadata; i++) {
                customMetadataToStore[this.customMetadata[i].inputRef.value] = (this.customMetadataValues[i].inputRef.value)
            }
            browser.storage.local.set({[this.pageId]: {defaultMetadata: this.state.metadata, customMetadata: customMetadataToStore}})
            console.log(browser.storage.local.get(null))
            // console.log(browser.storage.local.getBytesInUse())
            if (this.props.parentCallbackToUpdateList) {
                this.props.parentCallbackToUpdateList(this.state.metadata, this.pageId)
            }
        }
        // console.log(this.state)
    }

    openInGoogleScholar () {
        function onCreated(tab) {
            console.log(`Created new tab: ${tab.id}`)
        }
        function onError(error) {
            console.log(`Error: ${error}`)
        }
        const title = this.state.metadata['Title']
        const creating = browser.tabs.create({
            url: 'https://scholar.google.com/scholar?q=' + title,
        })
        creating.then(onCreated, onError)
    }

    render() {
        return <Modal
            closeIcon
            open={this.state.modalOpen}
            onClose={e => this.handleModalClose()}
            trigger={
                <Button
                    icon='edit'
                    id={this.pageId}
                    onClick={e => { e.preventDefault(); this.handleModalOpen() }}
                    floated='right'
                    tabIndex='-1'
                    title={'Edit metadata of this page'}
                />
            }>
            <Header icon='edit' content='Edit metadata' />
            <ModalContent scrolling>
                <div>
                    <Input
                        fluid
                        icon='search'
                        iconPosition='left'
                        title='Edit title'
                        placeholder='Title'
                        value={this.state.metadata['Title']}
                        onChange={e => { this.handleInputChange(e, 'Title') }}
                    />
                    <Input
                        fluid
                        icon='world'
                        iconPosition='left'
                        placeholder='URL'
                        title={`Edit URL`}
                        type='url'
                        value={this.state.metadata['URL']}
                        onChange={e => { this.handleInputChange(e, 'URL') }}
                    />
                    <Input
                        fluid
                        icon='comment'
                        iconPosition='left'
                        title='Edit description'
                        placeholder={`Description`}
                        value={this.state.metadata['Description']}
                        onChange={e => { this.handleInputChange(e, 'Description') }}
                    />
                    <Input
                        fluid
                        icon='tags'
                        iconPosition='left'
                        placeholder={`Keywords`}
                        title={`Edit keywords`}
                        // ref={(input) => { this.myInput = input }}
                        onChange={e => { this.handleInputChange(e, 'Keywords') }}
                        value={this.state.metadata['Keywords']}
                    />
                    <h5>Custom metadata</h5>
                    <div id='custom-metadata-container' />
                    <Button color='green' title={'Add new custom metadata'} onClick={e => { this.addNewMetadata() }}>
                        <Icon name='add' /> Add
                    </Button>
                </div>
            </ModalContent>
            <ModalActions>
                <Button color='blue' title={'Results will be displayed in a new tab'} onClick={e => this.openInGoogleScholar()}>
                    <Icon name='student' /> Open in Google Scholar
                </Button>
                <Button color='red' negative title={'Do not save changes'} onClick={e => this.handleModalClose()}>
                    <Icon name='remove' /> Cancel
                </Button>
                <Button color='green' positive title={'Save changes'} onClick={e => this.handleModalClose(true)}> {/* this.props.onEditButtonClick() */ }
                    <Icon name='checkmark' /> Save
                </Button>
            </ModalActions>
        </Modal>
    }
}
EditMetadataModal.propTypes = {
    page: PropTypes.object,
    onEditButtonClick: PropTypes.func,
    parentCallbackToUpdateList: PropTypes.func,
}
export default EditMetadataModal
