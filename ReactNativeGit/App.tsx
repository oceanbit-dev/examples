/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Platform,
  ProgressBarAndroid,
  ProgressViewIOS,
} from 'react-native';

import {
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

declare var global: {HermesInternal: null | {}};

// BEGIN OF INTERESTING ADDITIONS

import './patch-FileReader';

import {DocumentDirectoryPath} from 'react-native-fs';

import git from 'isomorphic-git/index.umd.min.js';
import http from 'isomorphic-git/http/web/index.js';

import {fs} from './fs';

// Note that since we're running isomorphic-git in the main thread, we're competing with React trying to update the UI.
// In order to achieve smooth progress bars, we need to insert a little pause.
// Curiously (perhaps a bug in isomorphic-git? I haven't figured that out yet) when these setTimeouts are added,
// the 'Counting objects' and 'Receiving objects' phases were interleaved, as were
// the 'Compressing objects' and 'Resolving deltas' phases. Since we can't show two progress phases simultaneously
// on a single progress bar, and since they are perfectly in step anyway, we'll just whitelist certain phases.
const phases: {[key: string]: boolean} = {
  'Receiving objects': true,
  'Resolving deltas': true,
  'Analyzing workdir': true,
  'Updating workdir': true,
};

const pauseToRender = () => new Promise(resolve => setTimeout(resolve, 0));

// This is last, because clone pretty much uses every single function. (Maybe not unlink / rmdir.)
const clone = async (setPhase: any, setLoaded: any, setTotal: any) => {
  try {
    setPhase('Downloading');
    setTotal(0);
    await git.clone({
      fs,
      http,
      dir: DocumentDirectoryPath + '/repo',
      url: 'https://github.com/unicorn-utterances/unicorn-utterances.git',
      async onProgress({phase, loaded, total}) {
        if (phases[phase]) {
          console.log(phase, loaded, total);
          setPhase(phase);
          setLoaded(loaded);
          setTotal(total || 0);
          await pauseToRender();
        }
      },
    });
    setPhase('Complete');
    setLoaded(1);
    setTotal(1);
    Alert.alert('clone', 'complete');
  } catch (err) {
    Alert.alert(
      err.code,
      `'${err.message}'` +
        '\n' +
        err.stack +
        '\n' +
        JSON.stringify(err, null, 2),
    );
  }
};

const App = () => {
  const [loaded, setLoaded] = React.useState(0);
  const [total, setTotal] = React.useState(-1);
  const [phase, setPhase] = React.useState('');

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.buttonContainer}>
              <Button
                title="Test clone"
                onPress={() => clone(setPhase, setLoaded, setTotal)}
              />
              <View style={styles.progressBar}>
                <Text>{phase}</Text>
                {Platform.OS === 'android' ? (
                  <ProgressBarAndroid
                    styleAttr="Horizontal"
                    style={styles.progressBar}
                    progress={total > 0 ? loaded / total : 0}
                    indeterminate={!total}
                  />
                ) : (
                  <ProgressViewIOS
                    progress={total > 0 ? loaded / total : 0}
                    style={styles.progressBar}
                  />
                )}
              </View>
            </View>
            {/* END OF INTERESTING ADDITIONS */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit <Text style={styles.highlight}>App.tsx</Text> to change
                this screen and then come back to see your edits.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>See Your Changes</Text>
              <Text style={styles.sectionDescription}>
                <ReloadInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Debug</Text>
              <Text style={styles.sectionDescription}>
                <DebugInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <Text style={styles.sectionDescription}>
                Read the docs to discover what to do next:
              </Text>
            </View>
            <LearnMoreLinks />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  buttonContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  progressBar: {
    flex: 1,
  },
});

export default App;
