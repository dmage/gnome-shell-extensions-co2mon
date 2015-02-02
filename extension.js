const Mainloop = imports.mainloop;

const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
// const Tweener = imports.ui.tweener;

let temp_button, temp_value,
    co2_button, co2_value,
    proxy;

// function _hideHello() {
//     Main.uiGroup.remove_actor(text);
//     text = null;
// }

// function _showHello() {
//     if (!text) {
//         text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
//         Main.uiGroup.add_actor(text);
//     }

//     text.opacity = 255;

//     let monitor = Main.layoutManager.primaryMonitor;

//     text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
//                       monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

//     Tweener.addTween(text,
//                      { opacity: 0,
//                        time: 2,
//                        transition: 'easeOutQuad',
//                        onComplete: _hideHello });
// }

const CO2MonDaemonIface = '<node>\
    <interface name="io.github.dmage.CO2Mon">\
        <signal name="NewValue">\
            <arg type="y"/>\
            <arg type="q"/>\
            <arg type="s"/>\
            <arg type="v"/>\
        </signal>\
    </interface>\
</node>';

const CO2MonDaemonProxy = Gio.DBusProxy.makeProxyWrapper(CO2MonDaemonIface);

function init_co2() {
    co2_button = new St.Bin({
        style_class: 'panel-button co2mon-panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    let layout = new St.BoxLayout({});

    let co2_co = new St.Label({
        style_class: 'co2mon-unit-label',
        text: "CO"
    });
    let co2_2 = new St.Label({
        style_class: 'co2mon-unit-subscript',
        text: "2"
    });
    co2_value = new St.Label({
        style_class: 'co2mon-value-label',
        text: "---"
    });

    layout.add_child(co2_value);
    layout.add_child(co2_co);
    layout.add_child(co2_2);
    co2_button.set_child(layout);
    co2_button.connect('button-press-event', function() {
        co2_value.set_text("click");
    });
}

function init_temp() {
    temp_button = new St.Bin({
        style_class: 'panel-button co2mon-panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    let layout = new St.BoxLayout({});

    temp_value = new St.Label({
        style_class: 'co2mon-value-label',
        text: "---"
    });
    let temp_degC = new St.Label({
        style_class: 'co2mon-unit-label',
        text: "°C"
    });

    layout.add_child(temp_value);
    layout.add_child(temp_degC);
    temp_button.set_child(layout);
    temp_button.connect('button-press-event', function() {
        temp_value.set_text("click");
    });
}

function init() {
    init_temp();
    init_co2();

    // let icon = new St.Icon({ icon_name: 'system-run-symbolic',
    //                          style_class: 'system-status-icon' });

    proxy = new CO2MonDaemonProxy(
        Gio.DBus.system,
        null, //"io.github.dmage.CO2Mon",
        "/io/github/dmage/CO2Mon"
    );
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(co2_button, 0);
    Main.panel._rightBox.insert_child_at_index(temp_button, 0);

    proxy.connectSignal("NewValue", function(proxy, sender, parameters) {
        let [code, raw_value, name, value] = parameters;
        if (name == "TEMP") {
            var rounded = Math.round(value.get_double()*10)/10;
            temp_value.set_text("" + rounded);
        } else if (name == "CO2") {
            co2_value.set_text("" + value.get_uint16());
        }
    });
}

function disable() {
    Main.panel._rightBox.remove_child(temp_button);
    Main.panel._rightBox.remove_child(co2_button);
}
