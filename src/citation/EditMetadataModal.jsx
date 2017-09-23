import React from 'react'
import { Button, Icon, Modal, Input, Header, ModalContent, ModalActions, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from './EditMetadataModel.css'
import Cite from "citation-js"
// A dialog which contains stored metadata. New metadata can be added.
class EditMetadataModal extends React.Component {
    constructor(props) {
        super(props)
        this.numberOfCustomMetadata = 0
        this.pageTitle = document.title
        this.state = { modalOpen: false, metadata: {} }
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    // Add new metadata entry
    addItem() {
        this.numberOfCustomMetadata++
        ReactDOM.render(this.getCustomMetadataList(this.numberOfCustomMetadata), document.getElementById('custom-metadata-container'))
    }

    // Create custom metadata list
    getCustomMetadataList(numberOfCustomMetadata) {
        const result = [...new Array(numberOfCustomMetadata)].map((el, i) =>
            <li key={i}>
                <Grid columns={2}>
                    <GridRow>
                        <GridColumn>
                            <Input
                                title={`New Metadata name`}
                                placeholder={`New Metadata name`}
                                defaultValue={'New metadata name'}
                            />
                        </GridColumn>
                        <GridColumn>
                            <Input
                                title={`New Metadata value`}
                                placeholder={`New Metadata value`}
                            />
                        </GridColumn>
                    </GridRow>
                </Grid>
            </li>
        )
        return <ul className={styles.cleanerListStyle}>{result}</ul>
    }

    /**
     *
     * @param input DOI or Wikidata or BibTex or BibJSON or CSL-JSON.
     * @return {Promise.<void>}
     */
    async getCitation(input) {
        const data = await Cite.async(input)
        const result = data.get({
            format: 'string',
            type: 'html',
            style: 'citation-apa',
            lang: 'en-US',
        })
        console.log(result)
    }

    handleChange(e, identifier) {
        const temp = this.state.metadata
        // Update item
        temp[identifier] = {identifier: identifier, value: e.target.value}
        console.log(temp)
        this.setState({metadata: temp})
        // console.log(e.target)
    }

    handleModalOpen () {
        this.setState({modalOpen: true})
        document.title = 'Edit metadata'
        // this.getCitation('10.1145/641007.641053')
        console.log(this.props.doc)
        console.log(this.state)
        if (Object.keys(this.state.metadata).length === 0) {
            const temp = {}
            let title = this.props.doc.page.title
            temp['Title'] = {identifier: 'Title', value: title}
            let description = this.props.doc.page.content? this.props.doc.page.content.description : null
            temp['Description'] = {identifier: 'Description', value: description}
            let url = this.props.doc.page.url
            temp['URL'] = {identifier: 'URL', value: url}
            let keywords = this.props.doc.page.content? this.props.doc.page.content.keywords : null
            temp['Keywords'] = {identifier: 'Keywords', value: keywords}
            this.setState({metadata: temp})
        }
        // var windows = browser.windows.getAll({populate: true}).then(value => {
        //     console.log(value)
        // })
        // for (var extensionWindow of windows) {
        //     console.log(extensionWindow.location.href)
        // }
    }

    handleModalClose () {
        this.setState({modalOpen: false})
        document.title = this.pageTitle
        // this.props.doc.page.content.keywords = this.state.metadata
    }

    render() {
        return <Modal
            closeIcon
            open={this.state.modalOpen}
            onClose={this.handleModalClose}
            trigger={
                <Button
                    icon='edit'
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
                        defaultValue={this.state.metadata['Title']? this.state.metadata['Title'].value : null}
                        onChange={e => { this.handleChange(e, 'Title') }}
                    />
                    <Input
                        fluid
                        icon='comment'
                        iconPosition='left'
                        title='Edit description'
                        placeholder={`Description`}
                        defaultValue={this.state.metadata['Description']? this.state.metadata['Description'].value : null}
                        onChange={e => { this.handleChange(e, 'Description') }}
                    />
                    <Input
                        fluid
                        icon='world'
                        iconPosition='left'
                        placeholder='URL'
                        title={`Edit URL`}
                        type='url'
                        defaultValue={this.state.metadata['URL']? this.state.metadata['URL'].value : null}
                        onChange={e => { this.handleChange(e, 'URL') }}
                    />
                    <Input
                        fluid
                        icon='tags'
                        iconPosition='left'
                        placeholder={`Keywords`}
                        title={`Edit keywords`}
                        // ref={(input) => { this.myInput = input }}
                        onChange={e => { this.handleChange(e, 'Keywords') }}
                        defaultValue={this.state.metadata['Keywords']? this.state.metadata['Keywords'].value : null}
                    />
                    <h5>Custom metadata</h5>
                    <div id='custom-metadata-container' />
                    <Button color='green' onClick={e => { this.addItem() }}>
                        <Icon name='add' title={'Add new custom metadata'} /> Add
                    </Button>
                </div>
            </ModalContent>
            <ModalActions>
                <Button color='red' negative onClick={this.handleModalClose}>
                    <Icon name='remove' /> Cancel
                </Button>
                <Button color='green' positive onClick={e => { this.props.onEditButtonClick() }}>
                    <Icon name='checkmark' /> Save
                </Button>
            </ModalActions>
        </Modal>
    }
}
EditMetadataModal.propTypes = {
    doc: PropTypes.object,
    onEditButtonClick: PropTypes.func,
}
export default EditMetadataModal
