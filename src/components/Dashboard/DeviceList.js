import React, { Component } from 'react';
import { connect } from 'react-redux';
import Obstruction from 'obstruction';
import * as Sentry from '@sentry/react';

import { withStyles, Typography, IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsIcon from '@material-ui/icons/Settings';

import MyCommaAuth from '@commaai/my-comma-auth';
import { devices as Devices } from '@commaai/api';

import { updateDevices } from '../../actions';
import Colors from '../../colors';
import { deviceTypePretty, deviceIsOnline, filterRegularClick, emptyDevice } from '../../utils';
import VisibilityHandler from '../VisibilityHandler';

import AddDevice from './AddDevice';
import DeviceSettingsModal from './DeviceSettingsModal';

const styles = (theme) => ({
  deviceList: {
    overflow: 'auto',
  },
  device: {
    textDecoration: 'none',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 32px',
    '&.isSelected': {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
  },
  settingsButton: {
    height: 46,
    width: 46,
    color: Colors.white30,
    transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: Colors.white,
    },
  },
  deviceOnline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green400,
  },
  deviceOffline: {
    backgroundColor: Colors.grey400,
  },
  deviceInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  deviceName: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 16,
  },
  deviceAlias: {
    fontWeight: 600,
  },
  deviceId: {
    color: '#74838e',
  },
  editDeviceIcon: {
    color: 'white',
    '&:hover': {
      color: theme.palette.grey[100],
    },
  },
  nameField: {
    marginRight: theme.spacing.unit,
  },
  saveButton: {
    marginRight: theme.spacing.unit,
  },
  textField: {
    marginBottom: theme.spacing.unit,
  },
  addDeviceContainer: {
    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.25)' },
  },
});

class DeviceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settingsModalDongleId: null,
    };

    this.renderDevice = this.renderDevice.bind(this);
    this.handleOpenedSettingsModal = this.handleOpenedSettingsModal.bind(this);
    this.handleClosedSettingsModal = this.handleClosedSettingsModal.bind(this);
    this.onVisible = this.onVisible.bind(this);
  }

  handleOpenedSettingsModal(dongleId, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ settingsModalDongleId: dongleId });
  }

  handleClosedSettingsModal() {
    this.setState({ settingsModalDongleId: null });
  }

  async onVisible() {
    const { dispatch } = this.props;
    if (MyCommaAuth.isAuthenticated()) {
      try {
        const devices = await Devices.listDevices();
        dispatch(updateDevices(devices));
      } catch (err) {
        console.error(err);
        Sentry.captureException(err, { fingerprint: 'devicelist_visible_listdevices' });
      }
    }
  }

  renderDevice(device) {
    const { classes, handleDeviceSelected, profile, selectedDevice } = this.props;
    const isSelectedCls = (selectedDevice === device.dongle_id) ? 'isSelected' : '';
    const alias = device.alias || deviceTypePretty(device.device_type);
    const offlineCls = !deviceIsOnline(device) ? classes.deviceOffline : '';
    return (
      <a
        key={device.dongle_id}
        className={ `${classes.device} ${isSelectedCls}` }
        onClick={ filterRegularClick(() => handleDeviceSelected(device.dongle_id)) }
        href={ `/${device.dongle_id}` }
      >
        <div className={classes.deviceInfo}>
          <div className={ `${classes.deviceOnline} ${offlineCls}` }>&nbsp;</div>
          <div className={ classes.deviceName }>
            <Typography className={classes.deviceAlias}>
              { alias }
            </Typography>
            <Typography variant="caption" className={classes.deviceId}>
              { device.dongle_id }
            </Typography>
          </div>
        </div>
        { (device.is_owner || (profile && profile.superuser))
          && (
          <IconButton
            className={classes.settingsButton}
            aria-label="device settings"
            onClick={ (ev) => this.handleOpenedSettingsModal(device.dongle_id, ev) }
          >
            <SettingsIcon className={classes.settingsButtonIcon} />
          </IconButton>
          )}
      </a>
    );
  }

  render() {
    const { settingsModalDongleId } = this.state;
    const { classes, device, headerHeight, selectedDevice: dongleId } = this.props;

    let { devices } = this.props;
    if (devices === null) {
      return null;
    }

    const found = devices.some((d) => d.dongle_id === dongleId);
    if (!found && device && dongleId === device.dongle_id) {
      devices = [{
        ...device,
        alias: emptyDevice.alias,
      }].concat(devices);
    } else if (!found && dongleId) {
      devices = [{
        ...emptyDevice,
        dongle_id: dongleId,
      }].concat(devices);
    }

    const addButtonStyle = {
      borderRadius: 'unset',
      backgroundColor: 'transparent',
      color: 'white',
      fontWeight: 600,
      justifyContent: 'space-between',
      padding: '16px 44px 16px 54px',
    };

    return (
      <>
        <VisibilityHandler onVisible={ this.onVisible } minInterval={ 10 } />
        <div
          className={`scrollstyle ${classes.deviceList}`}
          style={{ height: `calc(100vh - ${headerHeight}px)` }}
        >
          {devices.map(this.renderDevice)}
          {MyCommaAuth.isAuthenticated() && (
            <div className={classes.addDeviceContainer}>
              <AddDevice buttonText="add new device" buttonStyle={addButtonStyle} buttonIcon />
            </div>
          )}
        </div>
        <DeviceSettingsModal
          isOpen={Boolean(settingsModalDongleId)}
          dongleId={settingsModalDongleId}
          onClose={this.handleClosedSettingsModal}
        />
      </>
    );
  }
}

const stateToProps = Obstruction({
  devices: 'devices',
  device: 'device',
  profile: 'profile',
});

export default connect(stateToProps)(withStyles(styles)(DeviceList));
