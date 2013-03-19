# TODO: handle subPropertyOf better.

import os
from bs4 import BeautifulSoup

classes = []
classes_by_uri = {}
subclasses_by_uri = {}
properties = []

base_url = "http://alps.io/dc"

prefix = "http://purl.org/dc/terms/"
output_file = "dc.xml"

property_type = "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
class_type = "http://www.w3.org/2000/01/rdf-schema#Class"
literal_type = "http://www.w3.org/2000/01/rdf-schema#Literal"
dc_relation = "http://purl.org/dc/elements/1.1/relation"

DOCUMENT_START = "<alps>\n"
DOCUMENT_END = "</alps>"

ALPS_CLASS_BASE = """ <descriptor id="%(label)s" type="semantic"%(href)s>
  <doc>
   %(doc)s
  </doc>%(properties)s
 </descriptor>
"""

ALPS_PROPERTY_BASE = """
  <descriptor id="%(label)s" type="%(type)s"%(href)s %(rt)s>
   <doc>
    %(doc)s
   </doc>
  </descriptor>
"""

ALPS_PROPERTY_REFERENCE = """
  <descriptor%(href)s/>"""

def parse(markup):
    return BeautifulSoup(markup, "xml")

def string_with_property(tag, property):
    tag = with_property(tag, property)
    if tag is None:
        return None
    else:
        return tag.string

def with_property(tag, property):
    return tag.find(property=property)

def all_with_property(tag, property):
    return tag.find_all(property=property)

def fix_doc(s):
    return s

class RDFClass(object):
    def __init__(self, div, xml_id):
        self.uri = div['resource']
        classes_by_uri[self.uri] = self
        classes.append(self)
        self.xml_id = xml_id
        self.label = string_with_property(div, 'rdfs:label')
        self.comment = string_with_property(div, 'rdfs:comment')
        self.help_link = string_with_property(div, 'rdfs:isDefinedBy')
        self.superclasses = []
        self.superclass_classes = []
        self.unknown_superclasses = []
        self.properties = []
        for superclass in all_with_property(div, 'rdfs:subClassOf'):
                superclass_uri = superclass['href']
                self.superclasses.append(superclass_uri)
                subclasses_by_uri.setdefault(superclass_uri, []).append(self)


    def second_pass(self):
        # Now that the entire document has been loaded, resolve all references
        for url in self.superclasses:
            if url in classes_by_uri:
                self.superclass_classes.append(classes_by_uri[url])
            else:
                self.unknown_superclasses.append(url)

    @property
    def url(self):
        return base_url + '#' + self.xml_id

    @property
    def as_alps(self):
        values = dict(label=self.xml_id, doc=fix_doc(self.comment), href="",
                      properties='')
        superclass_urls = [superclass.url for superclass in self.superclass_classes]
        if len(superclass_urls) > 0:
            values['href'] = ' href="%s"' % (" ".join(superclass_urls))
        values['properties'] = '\n'.join(
            p.as_alps(self) for defining_class, p in self.all_properties)
        return ALPS_CLASS_BASE % values

    @property
    def all_properties(self):
        # Yield all properties defined in this class or superclasses,
        # in alphabetical order.
        unsorted = [(self, property) for property in self.properties]
        already_present = set(self.properties)

        for superclass in self.superclass_classes:
            for defined_by, property in superclass.all_properties:
                if property not in already_present:
                    already_present.add(property)
                    unsorted.append((defined_by, property))
        for c, p in sorted(unsorted, key=lambda x: x[1].label):
            yield c, p


class RDFProperty(object):

    def __init__(self, div, xml_id):
        self.uri = div['resource']
        self.id = xml_id
        self.domains = [x['href'] for x in all_with_property(div, 'rdfs:domain')]      
        self.ranges = [x['href'] for x in all_with_property(div, 'rdfs:range')]
        superproperties = [x['href'] for x in all_with_property(div, 'rdfs:subPropertyOf')]
        if dc_relation in superproperties:
            self.type = 'safe'
        else:
            self.type = 'semantic'
        self.domain_classes = []
        self.range_classes = []
        self.unknown_ranges = []
        self.unknown_domains = []
        self.comment = with_property(div, 'rdfs:comment').string
        self.label = with_property(div, 'rdfs:label').string
        properties.append(self)

    def second_pass(self):
        # Now that the entire document has been parsed, resolve types
        # of domains and ranges.
        for domain in self.domains:
            if domain in classes_by_uri:
                domain_class = classes_by_uri[domain]
                self.domain_classes.append(domain_class)
                domain_class.properties.append(p)
            else:
                self.unknown_domains.append(domain)
        for range in self.ranges:
            if range in classes_by_uri:
                range_class = classes_by_uri[range]
                self.range_classes.append(range_class)
            else:
                self.unknown_ranges.append(p)

    @property
    def url(self):
        return "#" + self.xml_id

    def as_alps(self, referenced_in_class=None):
        values = dict(
            type=self.type,
            label=self.xml_id,
            href="",
            rt="",
            doc=fix_doc(self.comment))

        if len(self.range_classes) > 0:
            values['rt'] = 'rt="' + " ".join(range_class.url for range_class in self.range_classes) + '"'

        if referenced_in_class is None:
            template = ALPS_PROPERTY_BASE
        else:
            template = ALPS_PROPERTY_REFERENCE
            # This is being included in a subclass of one of its
            # domain classes.  We need to link to the original
            # definition.
            values['href'] = ' href="%s"' % self.url
        return template % values


# Data comes from http://dublincore.org/documents/2012/06/14/dcmi-terms/
data = open("index.html")
soup = parse(data)

for resource in soup.find_all(resource=True):
    uri = resource['resource']
    if not uri.startswith(prefix):
        #print "Skipping %s" % uri
        continue
    xml_id = uri[len(prefix):]
    if xml_id == '':
        # Don't consider the Dublin Core document as a whole.
        continue
    term_type = with_property(resource, 'rdf:type')['href']
    if term_type == property_type:
        obj = RDFProperty(resource, xml_id)
    elif term_type == class_type:
        obj = RDFClass(resource, xml_id)
    else:
        print xml_id, term_type
    obj.xml_id = xml_id

# Now that we've parsed the entire document, associate properties with
# their domains and ranges.
for p in properties + classes:
    p.second_pass()

# Write the ALPS doc.
out = open(output_file, "w")
out.write(DOCUMENT_START)

for c in classes:
    out.write(c.as_alps + "\n")

for p in properties:
    out.write(p.as_alps() + "\n")

out.write(DOCUMENT_END)
