import React from 'react';
import PropTypes from 'prop-types';
import CancelOnUnmount from '../../../services/CancelOnUnmount.js'
import CampaignCoreSettingsRecommendationService from '../../../services/CampaignCoreSettingsRecommendationService';
import CampaignGeoRecommendationService from '../../../services/CampaignGeoRecommendationService';
import CampaignAdFormatRecommendationService from '../../../services/CampaignAdFormatRecommendationService';
import './Recommendations.scss'

export default class Recommendations extends React.Component {
  static propTypes = {
    recommendationType: PropTypes.oneOf([
      'CAMPAIGN_CORE_SETTINGS_RECOMMENDATIONS',
      'CAMPAIGN_GEO_RECOMMENDATIONS',
      'CAMPAIGN_ADFORMAT_RECOMMENDATIONS'
    ]).isRequired,
    campaignId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      newRecommendationText: '',
      recommendations: [],
    };

    this.handleAddRecommendation = this.handleAddRecommendation.bind(this);
    this.handleAddCampaignCoreSettingsRecommendation = this.handleAddCampaignCoreSettingsRecommendation.bind(this);
    this.handleAddCampaignAdFormatRecommendation = this.handleAddCampaignAdFormatRecommendation.bind(this);
    this.handleEmptyRecommendation = this.handleEmptyRecommendation.bind(this);
    this.handleTextAreaChanged = this.handleTextAreaChanged.bind(this);
    this.recommendationsState = this.recommendationsState.bind(this);
  }

  // switch is slightly faster so changed for optimization
  recommendationsState() {
    switch (this.props.recommendationType) {
      default:
        //CAMPAIGN_CORE_SETTINGS_RECOMMENDATIONS
        return CancelOnUnmount.track(this, CampaignCoreSettingsRecommendationService
          .getAllRecommendations(this.props.campaignId)
          .then(recommendations => {
            this.setState({
              recommendations: recommendations
            })
          }));
      case 'CAMPAIGN_GEO_RECOMMENDATIONS':
        return CancelOnUnmount.track(this, CampaignGeoRecommendationService
          .getAllRecommendations(this.props.campaignId)
          .then(recommendations => {
            this.setState({
              recommendations: recommendations
            })
          }));
        break;
      case 'CAMPAIGN_ADFORMAT_RECOMMENDATIONS':
        return CancelOnUnmount.track(this, CampaignAdFormatRecommendationService
          .getAllRecommendations(this.props.campaignId)
          .then(recommendations => {
            this.setState({
              recommendations: recommendations
            })
          }));
        break;
    }
  }

  // separated the logic for this hook to make cleaner and follow project pattern
  componentDidMount() {
    this.recommendationsState();
  }

  componentWillUnmount() {
    CancelOnUnmount.handleUnmount(this);
  }

  handleTextAreaChanged(e) {
    this.setState({newRecommendationText: e.target.value});
  }

  handleAddCampaignCoreSettingsRecommendation(recommendationText) {
    CancelOnUnmount.track(this, CampaignCoreSettingsRecommendationService
      .addRecommendation(this.props.campaignId, recommendationText)
      .then(recommendation => {
        this.setState({recommendations: this.state.recommendations.concat(recommendation)})
      })
      .catch(() => {
        alert('Couldn\'t add recommendation, please try again.');
      }));
  }

  handleAddCampaignAdFormatRecommendation(recommendationText) {
    CancelOnUnmount.track(this, CampaignAdFormatRecommendationService
      .addRecommendation(this.props.campaignId, recommendationText)
      .then(recommendation => {
        this.setState({recommendations: this.state.recommendations.concat(recommendation)})
      })
      .catch(() => {
        alert('Couldn\'t add recommendation, please try again.');
      }));
  }

  handleEmptyRecommendation() {
    alert('Cannot add an empty recommendation, please try again.');
  }

  handleAddRecommendation() {
    if (this.state.newRecommendationText) {
      const recommendationText = this.state.newRecommendationText;
      this.setState({newRecommendationText: ''}); // clears input for newReco

      if (this.props.recommendationType === 'CAMPAIGN_CORE_SETTINGS_RECOMMENDATIONS') {
        this.handleAddCampaignCoreSettingsRecommendation(recommendationText);
      } else if (this.props.recommendationType === 'CAMPAIGN_ADFORMAT_RECOMMENDATIONS') {
        this.handleAddCampaignAdFormatRecommendation(recommendationText);
      }
    } else {
      this.handleEmptyRecommendation();
    }

  }

  handleDismissRecommendation(recommendationId) {
    switch (this.props.recommendationType) {
      default:
        //CAMPAIGN_CORE_SETTINGS_RECOMMENDATIONS
        return CancelOnUnmount.track(this, CampaignCoreSettingsRecommendationService
          .dismissRecommendation(this.props.campaignId, recommendationId)
          .then(dismissedRecId => {
            console.log('dismissed a Core Settings reco with id ', dismissedRecId)
            CampaignCoreSettingsRecommendationService.getAllRecommendations(this.props.campaignId)
              .then(recommendations => {
                this.setState({
                  recommendations: recommendations
                })
              })
          }));
      case 'CAMPAIGN_GEO_RECOMMENDATIONS':
        return CancelOnUnmount.track(this, CampaignGeoRecommendationService
          .dismissRecommendation(this.props.campaignId, recommendationId)
          .then(dismissedRecId => {
            console.log('dismissed a Geo reco with id ', dismissedRecId)
            CampaignGeoRecommendationService.getAllRecommendations(this.props.campaignId)
              .then(recommendations => {
                this.setState({
                  recommendations: recommendations
                })
              })
          }));
        break;
      case 'CAMPAIGN_ADFORMAT_RECOMMENDATIONS':
        return CancelOnUnmount.track(this, CampaignAdFormatRecommendationService
          .dismissRecommendation(this.props.campaignId, recommendationId)
          .then(dismissedRecId => {
            console.log('dismissed and Add Format reco with id ', dismissedRecId)
            CampaignAdFormatRecommendationService.getAllRecommendations(this.props.campaignId)
              .then(recommendations => {
                this.setState({
                  recommendations: recommendations
                })
              })
          }));
        break;
    }
  }

  renderSingleRecommendation(id, recommendationText) {
    return (
      <div key={ id } className="recommendations__single">
        <div className="reco_text">{ recommendationText }</div>
        <div className="dismiss_reco">
          <button onClick={ this.handleDismissRecommendation.bind(this, id) }>Dismiss</button>
        </div>
      </div>
    );
  }

  renderRecommendationList() {
    return (
      <div className="recommendations_list">
        { this.props.recommendationType === 'CAMPAIGN_CORE_SETTINGS_RECOMMENDATIONS' &&
        <div className="reco_item">
          { this.state.recommendations.map(r => this.renderSingleRecommendation(r.id, r.text, r.username)) }
        </div>
        }

        { this.props.recommendationType === 'CAMPAIGN_GEO_RECOMMENDATIONS' &&
        <div className="reco_item">
          { this.state.recommendations.map(r => this.renderSingleRecommendation(r.auto_optimizer_id, r.auto_optimizer_explanation, 'auto_optimizer')) }
        </div>
        }

        { this.props.recommendationType === 'CAMPAIGN_ADFORMAT_RECOMMENDATIONS' &&
        <div className="reco_item">
          { this.state.recommendations.map(r => this.renderSingleRecommendation(r.id, r.suggestion, r.username)) }
        </div>
        }

      </div>
    );
  }

  render() {
    return (
      <div className="recommendations">
        <h3>Recommendations</h3>
        { this.renderRecommendationList() }
        { this.props.showAddRecommendations ?
          <div className="add_reco">
            <h3>Add Recommendation</h3>
            <div className="add_reco_textarea">
              <textarea value={ this.state.newRecommendationText } onChange={ this.handleTextAreaChanged }/>
            </div>
            <div>
              <button onClick={ this.handleAddRecommendation }>Add</button>
            </div>
          </div> : null }
      </div>
    );
  }

}