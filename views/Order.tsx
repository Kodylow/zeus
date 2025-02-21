import * as React from 'react';
import {
    StyleSheet,
    ScrollView,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import { ButtonGroup, Header, Icon } from 'react-native-elements';
import { inject, observer } from 'mobx-react';

import Amount from './../components/Amount';
import Button from './../components/Button';
import KeyValue from './../components/KeyValue';
import { Spacer } from './../components/layout/Spacer';
import TextInput from './../components/TextInput';

import { localeString } from './../utils/LocaleUtils';
import { themeColor } from './../utils/ThemeUtils';

import SettingsStore from './../stores/SettingsStore';
import FiatStore from './../stores/FiatStore';
import { SATS_PER_BTC } from './../stores/UnitsStore';

interface OrderProps {
    navigation: any;
    SettingsStore: SettingsStore;
    FiatStore: FiatStore;
}

interface OrderState {
    order: any;
    selectedIndex: number;
    customPercentage: string;
    customAmount: string;
    customType: string;
    units: string;
}

@inject('FiatStore', 'SettingsStore')
@observer
export default class OrderView extends React.Component<OrderProps, OrderState> {
    constructor(props: any) {
        super(props);
        const { navigation } = props;
        const order = navigation.getParam('order', null);

        this.state = {
            order,
            selectedIndex: 0,
            customPercentage: '21',
            customAmount: '',
            customType: 'percentage',
            units: 'sats'
        };
    }

    render() {
        const { navigation, FiatStore, SettingsStore } = this.props;
        const {
            order,
            selectedIndex,
            customPercentage,
            customAmount,
            customType,
            units
        } = this.state;
        const { fiatRates, getRate }: any = FiatStore;
        const { settings } = SettingsStore;
        const fiat = settings.fiat;

        const memo = `ZEUS POS: ${order.id} | ${getRate()}`;

        const lineItems = order.line_items;

        const twentyPercentButton = () => (
            <Text
                style={{
                    fontFamily: 'Lato-Regular',
                    color:
                        selectedIndex === 0
                            ? themeColor('background')
                            : themeColor('text')
                }}
            >
                20%
            </Text>
        );
        const twentyFivePercentButton = () => (
            <Text
                style={{
                    fontFamily: 'Lato-Regular',
                    color:
                        selectedIndex === 1
                            ? themeColor('background')
                            : themeColor('text')
                }}
            >
                25%
            </Text>
        );
        const thirtyPercentButton = () => (
            <Text
                style={{
                    fontFamily: 'Lato-Regular',
                    color:
                        selectedIndex === 2
                            ? themeColor('background')
                            : themeColor('text')
                }}
            >
                30%
            </Text>
        );
        const customButton = () => (
            <Text
                style={{
                    fontFamily: 'Lato-Regular',
                    color:
                        selectedIndex === 3
                            ? themeColor('background')
                            : themeColor('text')
                }}
            >
                Custom
            </Text>
        );

        const Divider = () => (
            <View
                style={{
                    margin: 10,
                    height: 2,
                    borderRadius: 6,
                    backgroundColor: themeColor('secondary')
                }}
            >
                <Spacer />
            </View>
        );

        const buttons = [
            { element: twentyPercentButton },
            { element: twentyFivePercentButton },
            { element: thirtyPercentButton },
            { element: customButton }
        ];

        let totalAmount = '0';
        let tipAmount = '0';
        switch (selectedIndex) {
            case 0:
                totalAmount = (order.getTotalMoney * 1.2).toFixed(2);
                tipAmount = (order.getTotalMoney * 0.2).toFixed(2);
                break;
            case 1:
                totalAmount = (order.getTotalMoney * 1.25).toFixed(2);
                tipAmount = (order.getTotalMoney * 0.25).toFixed(2);
                break;
            case 2:
                totalAmount = (order.getTotalMoney * 1.3).toFixed(2);
                tipAmount = (order.getTotalMoney * 0.3).toFixed(2);
                break;
            default:
                if (customType === 'percentage') {
                    totalAmount = (
                        order.getTotalMoney * Number(`1.${customPercentage}`)
                    ).toFixed(2);
                    tipAmount = (
                        order.getTotalMoney *
                        (Number(customPercentage) / 100)
                    ).toFixed(2);
                } else if (customType === 'amount') {
                    totalAmount = !isNaN(Number(customAmount))
                        ? `${Number(
                              Number(order.getTotalMoney) + Number(customAmount)
                          ).toFixed(2)}`
                        : order.getTotalMoney;
                    tipAmount = !isNaN(Number(customAmount))
                        ? Number(customAmount).toFixed(2)
                        : '0';
                }
        }

        const fiatEntry =
            fiat && fiatRates && fiatRates.filter
                ? fiatRates.filter((entry: any) => entry.code === fiat)[0]
                : null;

        const rate = fiat && fiatRates && fiatEntry ? fiatEntry.rate : 0;

        const satAmount: string = Number(
            (Number(totalAmount.replace(/,/g, '.')) / Number(rate)) *
                Number(SATS_PER_BTC)
        ).toFixed(0);

        const BackButton = () => (
            <Icon
                name="arrow-back"
                onPress={() => navigation.goBack()}
                color={themeColor('text')}
                underlayColor="transparent"
            />
        );

        return (
            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: themeColor('background')
                }}
            >
                <Header
                    leftComponent={<BackButton />}
                    centerComponent={{
                        text: localeString('general.order'),
                        style: {
                            color: themeColor('text'),
                            fontFamily: 'Lato-Regular'
                        }
                    }}
                    backgroundColor={themeColor('background')}
                    containerStyle={{
                        borderBottomWidth: 0
                    }}
                />

                <View style={styles.content}>
                    {lineItems.map((item: any, index: number) => {
                        const keyValue =
                            item.quantity > 1
                                ? `${item.name} (x${item.quantity})`
                                : item.name;
                        return (
                            <KeyValue
                                key={index}
                                keyValue={keyValue}
                                value={`$${Number(
                                    item.total_money.amount / 100
                                ).toFixed(2)}`}
                            />
                        );
                    })}

                    <Divider />

                    <KeyValue
                        keyValue={localeString('pos.views.Order.tax')}
                        value={order.getTaxMoneyDisplay}
                    />

                    <KeyValue
                        keyValue={localeString(
                            'pos.views.Order.totalBeforeTip'
                        )}
                        value={order.getTotalMoneyDisplay}
                    />

                    <Divider />

                    <Text
                        style={{
                            color: themeColor('text'),
                            alignSelf: 'center',
                            margin: 10
                        }}
                    >
                        {localeString('pos.views.Order.addTip')}
                    </Text>

                    <ButtonGroup
                        onPress={(selectedIndex: number) => {
                            this.setState({ selectedIndex });
                        }}
                        selectedIndex={selectedIndex}
                        buttons={buttons}
                        selectedButtonStyle={{
                            backgroundColor: themeColor('highlight'),
                            borderRadius: 12
                        }}
                        containerStyle={{
                            backgroundColor: themeColor('secondary'),
                            borderRadius: 12,
                            borderColor: themeColor('secondary')
                        }}
                        innerBorderStyle={{
                            color: themeColor('secondary')
                        }}
                    />

                    {selectedIndex === 3 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                width: '95%',
                                alignSelf: 'center'
                            }}
                        >
                            <TextInput
                                suffix="%"
                                keyboardType="numeric"
                                right={25}
                                value={customPercentage}
                                onChangeText={(text: string) =>
                                    this.setState({
                                        customPercentage: text
                                    })
                                }
                                onPressIn={() =>
                                    this.setState({
                                        customType: 'percentage'
                                    })
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{
                                    width: '50%',
                                    marginRight: 10,
                                    opacity:
                                        customType == 'percentage' ? 1 : 0.25
                                }}
                            />
                            <TextInput
                                prefix={FiatStore.getSymbol().symbol}
                                keyboardType="numeric"
                                right={25}
                                value={customAmount}
                                onChangeText={(text: string) => {
                                    if (
                                        text.includes('-') ||
                                        (text.split('.')[1] &&
                                            text.split('.')[1].length === 3)
                                    )
                                        return;
                                    this.setState({
                                        customAmount: text
                                    });
                                }}
                                onPressIn={() =>
                                    this.setState({
                                        customType: 'amount'
                                    })
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{
                                    width: '50%',
                                    opacity: customType == 'amount' ? 1 : 0.25
                                }}
                            />
                        </View>
                    )}

                    <KeyValue
                        keyValue={localeString('pos.views.Order.tip')}
                        value={`$${tipAmount}`}
                    />

                    <KeyValue
                        keyValue={localeString('pos.views.Order.totalFiat')}
                        value={`$${totalAmount}`}
                    />

                    <Divider />

                    <KeyValue keyValue={'Conversion Rate'} value={getRate()} />

                    <TouchableOpacity
                        onPress={() => {
                            this.setState({
                                units:
                                    this.state.units === 'sats' ? 'BTC' : 'sats'
                            });
                        }}
                    >
                        <KeyValue
                            keyValue={localeString(
                                'pos.views.Order.totalBitcoin'
                            )}
                            value={
                                units === 'sats' ? (
                                    <Amount
                                        fixedUnits="sats"
                                        sats={satAmount}
                                    />
                                ) : (
                                    <Amount fixedUnits="BTC" sats={satAmount} />
                                )
                            }
                        />
                    </TouchableOpacity>

                    <Button
                        title={localeString('general.pay')}
                        containerStyle={{ marginTop: 40 }}
                        onPress={() =>
                            navigation.navigate('Receive', {
                                amount: satAmount,
                                autoGenerate: true,
                                memo,
                                orderId: order.id,
                                orderTip: Number(tipAmount) * 100,
                                orderAmount: Number(order.getTotalMoney) * 100
                            })
                        }
                        disabled={isNaN(Number(satAmount))}
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        paddingLeft: 20,
        paddingRight: 20
    },
    center: {
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15
    }
});
